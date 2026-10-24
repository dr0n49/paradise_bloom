"""Shared pieces for the generated character rigs (Spine 4.3 runtime JSON): skeleton maths,
weighted meshes, easing/keys, and turning sampled poses into decimated timelines."""
import math

TAU = 2 * math.pi


# ---------------------------------------------------------------- easing and tracks
def smooth(a, b, x):
    if a == b:
        return 1.0 if x >= b else 0.0
    k = min(1.0, max(0.0, (x - a) / (b - a)))
    return k * k * (3 - 2 * k)


def sm(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def back_out(x):
    x = min(1.0, max(0.0, x))
    c = 1.7
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2


def track(t, keys, ease=sm):
    """Piecewise eased value: keys = [(time, value or tuple)], held before the first and after the last."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            k = ease((t - t0) / (t1 - t0)) if t1 > t0 else 1.0
            if isinstance(v0, tuple):
                return tuple(a + (b - a) * k for a, b in zip(v0, v1))
            return v0 + (v1 - v0) * k
    return keys[-1][1]


def step(t, keys):
    """Held value (attachment swaps): keys = [(time, value)]."""
    v = keys[0][1]
    for t0, v0 in keys:
        if t >= t0:
            v = v0
    return v


def bump(t, a, b, edge=0.25):
    return sm((t - a) / edge) * sm((b - t) / edge)


def catmull(t, pts):
    """Uniform Catmull-Rom through [(time, (x, y))], timed per segment."""
    if t <= pts[0][0]:
        return pts[0][1]
    if t >= pts[-1][0]:
        return pts[-1][1]
    i = 0
    for i in range(len(pts) - 1):
        if pts[i][0] <= t <= pts[i + 1][0]:
            break
    p0 = pts[max(0, i - 1)][1]; p1 = pts[i][1]; p2 = pts[i + 1][1]; p3 = pts[min(len(pts) - 1, i + 2)][1]
    u = (t - pts[i][0]) / (pts[i + 1][0] - pts[i][0])
    u2, u3 = u * u, u * u * u
    return tuple(0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3)
                 for a, b, c, d in zip(p0, p1, p2, p3))


class Pose(dict):
    """bone -> [rotate, x, y, scaleX, scaleY] offsets from the setup pose."""

    def add(self, bone, r=0.0, x=0.0, y=0.0, sx=1.0, sy=1.0):
        e = self.setdefault(bone, [0.0, 0.0, 0.0, 1.0, 1.0])
        e[0] += r; e[1] += x; e[2] += y; e[3] *= sx; e[4] *= sy


# ---------------------------------------------------------------- skeleton
def rot2(x, y, deg):
    r = math.radians(deg)
    return x * math.cos(r) - y * math.sin(r), x * math.sin(r) + y * math.cos(r)


class Skeleton:
    """Bones given in skeleton space (S, y up) as world positions; local transforms are derived."""

    def __init__(self):
        self.order, self.parent, self.world, self.local, self.length = [], {}, {}, {}, {}

    def bone(self, name, parent=None, at=(0.0, 0.0), tip=None, rot=0.0):
        wr = rot
        if tip is not None:
            wr = math.degrees(math.atan2(tip[1] - at[1], tip[0] - at[0]))
            self.length[name] = math.hypot(tip[0] - at[0], tip[1] - at[1])
        self.world[name] = (at[0], at[1], wr)
        if parent:
            px, py, pr = self.world[parent]
            lx, ly = rot2(at[0] - px, at[1] - py, -pr)
            self.local[name] = (lx, ly, wr - pr)
        else:
            self.local[name] = (at[0], at[1], wr)
        self.order.append(name)
        self.parent[name] = parent
        return name

    def index(self, name):
        return self.order.index(name)

    def fk(self, pose):
        W = {}
        for name in self.order:
            lx, ly, lr = self.local[name]
            o = pose.get(name, (0, 0, 0, 1, 1))
            r = math.radians(lr + o[0])
            a, b, c, d = math.cos(r) * o[3], -math.sin(r) * o[4], math.sin(r) * o[3], math.cos(r) * o[4]
            x, y = lx + o[1], ly + o[2]
            par = self.parent[name]
            if par:
                pa, pb, pc, pd, px, py = W[par]
                W[name] = (pa * a + pb * c, pa * b + pb * d, pc * a + pd * c, pc * b + pd * d, pa * x + pb * y + px, pc * x + pd * y + py)
            else:
                W[name] = (a, b, c, d, x, y)
        return W

    def pos(self, pose, name):
        w = self.fk(pose)[name]
        return w[4], w[5]

    def bind(self, name, s):
        """A skeleton-space point in the bone's setup space."""
        bx, by, br = self.world[name]
        return rot2(s[0] - bx, s[1] - by, -br)

    def json(self):
        out = []
        for name in self.order:
            b = {"name": name}
            if self.parent[name]:
                b["parent"] = self.parent[name]
            lx, ly, lr = self.local[name]
            if abs(lx) > 1e-3:
                b["x"] = round(lx, 2)
            if abs(ly) > 1e-3:
                b["y"] = round(ly, 2)
            if abs(lr) > 1e-3:
                b["rotation"] = round(lr, 3)
            if name in self.length:
                b["length"] = round(self.length[name], 2)
            out.append(b)
        return out


# ---------------------------------------------------------------- meshes
def grid_mesh(skel, img, x0, y0, to_s, step, weight_fn, scale=1.0):
    """A grid mesh over the opaque cells of img (placed at P (x0, y0)); weight_fn(P) -> [(bone, w)]."""
    w, h = img.size
    xs = sorted(set(list(range(0, w, step)) + [w]))
    ys = sorted(set(list(range(0, h, step)) + [h]))
    alpha = img.split()[3]
    cells, used = [], set()
    for j in range(len(ys) - 1):
        for i in range(len(xs) - 1):
            if alpha.crop((xs[i], ys[j], max(xs[i + 1], xs[i] + 1), max(ys[j + 1], ys[j] + 1))).getbbox():
                cells.append((i, j))
                used |= {(i, j), (i + 1, j), (i, j + 1), (i + 1, j + 1)}
    idx, uvs, verts = {}, [], []
    for (i, j) in sorted(used, key=lambda v: (v[1], v[0])):
        idx[(i, j)] = len(idx)
        vx, vy = xs[i], ys[j]
        uvs += [round(vx / w, 5), round(vy / h, 5)]
        p = (x0 + vx, y0 + vy)
        s = to_s(p)
        ws = weight_fn(p)
        verts.append(len(ws))
        for b, v in ws:
            lx, ly = skel.bind(b, s)
            verts += [skel.index(b), round(lx, 2), round(ly, 2), round(v, 4)]
    tris = []
    for (i, j) in cells:
        a, b, c, d = idx[(i, j)], idx[(i + 1, j)], idx[(i + 1, j + 1)], idx[(i, j + 1)]
        tris += [a, b, c, a, c, d]
    return {"type": "mesh", "uvs": uvs, "triangles": tris, "vertices": verts, "hull": 0,
            "width": round(w * scale, 2), "height": round(h * scale, 2)}


def top4(weights):
    top = sorted(((v, b) for b, v in weights.items() if v > 0.01), reverse=True)[:4]
    tot = sum(v for v, _ in top) or 1.0
    return [(b, v / tot) for v, b in top]


# ---------------------------------------------------------------- timelines
def decimate(times, vals, tol):
    keep, i, n = [0], 0, len(vals)
    while i < n - 1:
        j = i + 1
        while j + 1 < n:
            ok = True
            for m in range(i + 1, j + 2):
                k = (times[m] - times[i]) / (times[j + 1] - times[i])
                if any(abs(vals[i][c] + (vals[j + 1][c] - vals[i][c]) * k - vals[m][c]) > tol for c in range(len(vals[0]))):
                    ok = False
                    break
            if not ok:
                break
            j += 1
        keep.append(j)
        i = j
    return keep


def _k(t):
    return {"time": round(t, 4)} if t else {}


def keys1(times, vals, tol):
    return [dict(_k(times[i]), value=round(vals[i], 3)) for i in decimate(times, [(v,) for v in vals], tol)]


def keys2(times, vals, tol, default):
    out = []
    for i in decimate(times, vals, tol):
        k = _k(times[i])
        x, y = vals[i]
        if abs(x - default) > 1e-6:
            k["x"] = round(x, 4)
        if abs(y - default) > 1e-6:
            k["y"] = round(y, 4)
        out.append(k)
    return out


def keys_color(times, vals):
    return [dict(_k(times[i]), color="".join(f"{int(round(c * 255)):02x}" for c in vals[i]))
            for i in decimate(times, vals, 1.5 / 255)]


def timelines(times, frames, setup_alpha, setup_attachment, stepped=()):
    """frames: [(Pose, {slot: ((r,g,b) 0-255, alpha)}, {slot: attachment or None})] -> animation JSON.
    Bones in `stepped` jump between keys (e.g. a flip, which must never pass through scale 0)."""
    bones, slots = {}, {}
    for b in sorted({b for f in frames for b in f[0]}):
        vals = [f[0].get(b, [0, 0, 0, 1, 1]) for f in frames]
        tl = {}
        if any(abs(v[0]) > 1e-3 for v in vals):
            tl["rotate"] = keys1(times, [v[0] for v in vals], 0.05)
        if any(abs(v[1]) > 1e-2 or abs(v[2]) > 1e-2 for v in vals):
            tl["translate"] = keys2(times, [(v[1], v[2]) for v in vals], 0.3, 0.0)
        if any(abs(v[3] - 1) > 1e-4 or abs(v[4] - 1) > 1e-4 for v in vals):
            tl["scale"] = keys2(times, [(v[3], v[4]) for v in vals], 0.002, 1.0)
        if tl and b in stepped:
            for keys in tl.values():
                for key in keys[:-1]:
                    key["curve"] = "stepped"
        if tl:
            bones[b] = tl
    for sl in sorted({s for f in frames for s in f[1]}):
        vals = []
        for f in frames:
            rgb, a = f[1].get(sl, ((255, 255, 255), setup_alpha.get(sl, 1.0)))
            vals.append((rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, max(0.0, min(1.0, a))))
        slots.setdefault(sl, {})["rgba"] = keys_color(times, vals)
    for sl in sorted({s for f in frames for s in f[2]}):
        keys, last = [], object()
        for t, f in zip(times, frames):
            name = f[2].get(sl, setup_attachment.get(sl))
            if name != last:
                keys.append(dict(_k(t), name=name))
                last = name
        if len(keys) > 1 or keys[0]["name"] != setup_attachment.get(sl):
            slots.setdefault(sl, {})["attachment"] = keys
    out = {"bones": bones}
    if slots:
        out["slots"] = slots
    return out
