/** Currency comes from the wallet (or the explicit replay URL), never locale.
 * Amounts stay in their original currency; no exchange-rate conversion. */
const META:Record<string,{symbol:string;digits:number;post?:boolean}>={
 USD:{symbol:'$',digits:2},CAD:{symbol:'CA$',digits:2},JPY:{symbol:'¥',digits:0},EUR:{symbol:'€',digits:2},
 RUB:{symbol:'₽',digits:2},CNY:{symbol:'CN¥',digits:2},PHP:{symbol:'₱',digits:2},INR:{symbol:'₹',digits:2},
 IDR:{symbol:'Rp',digits:0},KRW:{symbol:'₩',digits:0},BRL:{symbol:'R$',digits:2},MXN:{symbol:'MX$',digits:2},
 DKK:{symbol:'kr',digits:2,post:true},PLN:{symbol:'zł',digits:2,post:true},VND:{symbol:'₫',digits:0,post:true},
 // Stake.US social coins.
 XSC:{symbol:'SC',digits:2,post:true},XGC:{symbol:'GC',digits:2,post:true},XEC:{symbol:'SC',digits:2,post:true},
};
/** Plain number in the currency's precision (board win labels show no symbol). */
export function formatPlain(amount:number,currency:string,reference=amount){
 const s=formatCurrency(amount,currency,'en-US',reference);const m=META[currency.toUpperCase()]??{symbol:currency.toUpperCase(),post:true};
 return (m.post?s.slice(0,-(m.symbol.length+1)):s.slice(m.symbol.length)).trim();
}
export function formatCurrency(amount:number,currency:string,locale='en-US',reference=amount){
 const code=currency.toUpperCase(),m=META[code]??{symbol:code,digits:2,post:true};
 const value=Number.isFinite(amount)?amount:0;
 // Show authoritative micro-units when they exist; a small valid bet must not
 // silently become zero even for normally whole-unit currencies.
 // Count-ups use the final authoritative amount as the precision reference.
 // Easing fractions never invent additional visible decimal places.
 const micros=Math.round(Math.abs(Number.isFinite(reference)?reference:0)*1e6);
 let meaningful=6;while(meaningful>m.digits&&micros%10**(6-meaningful+1)===0)meaningful--;
 const digits=Math.max(m.digits,meaningful);
 const number=new Intl.NumberFormat(locale,{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
 return m.post?`${number} ${m.symbol}`:`${m.symbol}${number}`;
}
export const SUPPORTED_CURRENCIES=Object.keys(META);
