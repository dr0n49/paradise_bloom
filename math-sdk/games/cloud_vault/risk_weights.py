"""Deterministic mean-preserving tail reweighting for Paradise Bloom.

Only selection weights change. Positive and zero mass in every criteria group
stay fixed to integer resolution. A common mean constraint restores exactly
96% RTP while the quadratic penalty moves return from tail to medium wins.
"""
import numpy as np

TOTAL = 10**15
SCALE = 5000.0
BASELINE_MIX = 0.02  # retain real tail coverage; never make the cap a token weight
MIN_SPIN_ALPHA = 1.3  # common tail policy across base and the two ante modes
# Targets leave headroom inside the stricter screenshot 2-star limits.
TARGETS = {
    'spin_std_per_cost':45.0,
    'tail5000':0.009, 'tail10000':0.004, 'tail25000':0.0008,
    'cvar_per_cost':680.0, 'cvar_absolute':18000.0,
    'etl40_per_cost':0.79, 'etl10000_per_cost':0.55, 'etl_sum_per_cost':1.20,
    'etl_absolute':2700.0,
}

def distribution_metrics(payout, probability, cost):
    """Exact fractional-atom upper-tail mean and conservative whole-atom variant."""
    p = np.asarray(probability,dtype=float)
    p = p/p.sum()
    y = np.asarray(payout,dtype=float)/100
    mean=float(p@y)
    remaining=.001
    tail=0.0
    for win, mass in zip(y[::-1],p[::-1]):
        take=min(float(mass),remaining)
        tail+=take*float(win)
        remaining-=take
        if remaining<=1e-18:break
    var_index=min(int(np.searchsorted(np.cumsum(p),.999)),len(y)-1)
    whole=float(p[var_index:]@y[var_index:]/p[var_index:].sum())
    cvar=max(tail/.001,whole)
    etl40=float(p[y>=40*cost]@y[y>=40*cost])/cost
    etl10=float(p[y>=10000]@y[y>=10000])/cost
    return {
        'rtp':mean/cost, 'std_per_cost':float(np.sqrt(p@((y-mean)**2)))/cost,
        'tail5000':float(p[y>=5000].sum()),'tail10000':float(p[y>=10000].sum()),
        'tail25000':float(p[y>=25000].sum()),
        'cvar_per_cost':cvar/cost,'cvar_absolute':cvar,
        'etl40_per_cost':etl40,'etl10000_per_cost':etl10,'etl_sum_per_cost':etl40+etl10,
        'etl_absolute':max(etl40,etl10)*cost,
    }

def violations(metrics,mode):
    targets={k:v for k,v in TARGETS.items() if k!='spin_std_per_cost'}
    if mode in ('base','extra_chance','super_chance'):
        targets['std_per_cost']=TARGETS['spin_std_per_cost']
    return {k:{'value':metrics[k],'target':v} for k,v in targets.items() if metrics[k]>v+1e-10}

def _round_positive(values, total):
    raw=np.asarray(values,dtype=float)*total
    rounded=np.maximum(1,np.floor(raw).astype(np.int64))
    delta=total-sum(map(int,rounded))
    if delta>0:
        ix=np.argsort(-(raw-rounded),kind='stable')[:delta]
        rounded[ix]+=1
    elif delta<0:
        order=np.argsort(raw-rounded,kind='stable')
        for i in order:
            take=min(int(rounded[i])-1,-delta)
            rounded[i]-=take;delta+=take
            if delta==0:break
    assert sum(map(int,rounded))==total and min(rounded)>0
    return rounded

def _exact_rtp(weights,pay,categories,cost):
    """Move integer mass within a positive criteria category; preserve hit/trigger mass."""
    target=96*int(cost)*TOTAL
    delta=target-sum(int(w)*int(p) for w,p in zip(weights,pay))
    if not delta:return
    # All current payouts are in tenths. Prefer the smallest payout step to
    # correct the residual without altering any zero or criteria mass.
    pairs=[]
    for indices in categories:
        if pay[indices[0]]==0:continue
        best={}
        for i in indices:
            p=int(pay[i])
            if p not in best or weights[i]>weights[best[p]]:best[p]=int(i)
        payouts=sorted(best)
        for low,high in zip(payouts,payouts[1:]):
            step=high-low
            if delta%step:continue
            donor=best[low] if delta>0 else best[high]
            recipient=best[high] if delta>0 else best[low]
            amount=abs(delta)//step
            if weights[donor]>amount:pairs.append((step,-int(weights[donor]),donor,recipient,amount))
    if not pairs:raise RuntimeError('Cannot correct RTP exactly within positive criteria mass')
    _,_,donor,recipient,amount=min(pairs)
    weights[donor]-=amount;weights[recipient]+=amount
    assert sum(int(w)*int(p) for w,p in zip(weights,pay))==target

def rebalance(rows, baseline_weights, groups, cost, mode):
    ids=np.array([i for i,_ in rows],dtype=np.int64)
    pay=np.array([p for _,p in rows],dtype=np.int64)
    old=np.array([baseline_weights[int(i)] for i in ids],dtype=np.int64)
    group_of={i:c for c,g in groups.items() for i,_ in g}
    categories=[]
    cache=[]
    for c in sorted(groups):
        for positive in (False,True):
            ix=np.array([n for n,i in enumerate(ids) if group_of[int(i)]==c and (pay[n]>0)==positive],dtype=np.int64)
            if not len(ix):continue
            unique,inverse=np.unique(pay[ix],return_inverse=True)
            mass=np.bincount(inverse,weights=old[ix].astype(float),minlength=len(unique))
            categories.append(ix)
            cache.append((ix,unique,inverse,mass,int(old[ix].sum()),c,positive))
    total_old=sum(map(int,old))
    unique_global,inverse_global=np.unique(pay,return_inverse=True)
    penalize_etl40=False
    def shape(alpha):
        target=.96*cost/SCALE
        def evaluate(lam):
            result=[];mean=0.0
            for _,unique,_,mass,category_total,_,_ in cache:
                q=mass/mass.sum()
                x=unique.astype(float)/100/SCALE
                etl_penalty=np.where(unique>=40*cost*100,unique.astype(float)/100/(40*cost),0.0) if penalize_etl40 else 0.0
                logp=np.log(q)+lam*x-alpha*(x*x+etl_penalty)
                pp=np.exp(logp-logp.max());pp/=pp.sum()
                pp=(1-BASELINE_MIX)*pp+BASELINE_MIX*q
                mean+=(category_total/total_old)*float(pp@x)
                result.append(pp)
            return result,mean
        lo,hi=-1.0,1.0
        while evaluate(lo)[1]>target:lo*=2
        while evaluate(hi)[1]<target:hi*=2
        for _ in range(65):
            mid=(lo+hi)/2
            if evaluate(mid)[1]<target:lo=mid
            else:hi=mid
        category_prob=evaluate((lo+hi)/2)[0]
        probability=np.zeros(len(ids),dtype=float)
        for (ix,unique,inverse,mass,category_total,_,_),q in zip(cache,category_prob):
            probability[ix]=q[inverse]*(old[ix]/mass[inverse])*(category_total/total_old)
        return probability
    def assess(prob):
        pm=np.bincount(inverse_global,weights=prob,minlength=len(unique_global))
        return distribution_metrics(unique_global,pm,cost)
    lo,hi=0.0,0.0
    initial=assess(shape(0))
    penalize_etl40=initial['etl40_per_cost']>TARGETS['etl40_per_cost']
    if violations(initial,mode):
        hi=.01
        while violations(assess(shape(hi)),mode):
            lo=hi;hi*=2
            if hi>100000:raise RuntimeError(f'{mode}: target limits infeasible with current group means')
        for _ in range(22):
            mid=(lo+hi)/2
            if violations(assess(shape(mid)),mode):lo=mid
            else:hi=mid
        hi=hi*1.02+.0001  # avoid an integer-rounding boundary
    if mode in ('base','extra_chance','super_chance'):
        hi=max(hi,MIN_SPIN_ALPHA)
    prob=shape(hi)
    category_raw=np.array([item[4]/total_old*TOTAL for item in cache])
    category_totals=np.floor(category_raw).astype(np.int64)
    delta=TOTAL-sum(map(int,category_totals))
    for i in np.argsort(-(category_raw-category_totals),kind='stable')[:delta]:category_totals[i]+=1
    weights=np.zeros(len(ids),dtype=np.int64)
    for item,category_total in zip(cache,category_totals):
        ix=item[0];q=prob[ix];q=q/q.sum()
        weights[ix]=_round_positive(q,int(category_total))
    _exact_rtp(weights,pay,categories,cost)
    final=assess(weights.astype(float)/TOTAL)
    assert not violations(final,mode),(mode,violations(final,mode))
    assert sum(map(int,weights))==TOTAL and min(weights)>0
    report={'revision':'risk-v2','alpha':hi,'minimum_spin_alpha':MIN_SPIN_ALPHA,'etl40_penalty':penalize_etl40,'baseline_mixture':BASELINE_MIX,'targets':TARGETS,'before':initial,'after':final,
            'exact_rtp':{'numerator':str(sum(int(w)*int(p) for w,p in zip(weights,pay))),
                         'denominator':str(TOTAL*int(cost)*100)},
            'all_weights_positive':True,'rows':len(ids)}
    return {int(i):int(w) for i,w in zip(ids,weights)},report
