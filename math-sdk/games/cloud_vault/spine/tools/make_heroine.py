"""Rig the layered heroine (spine/character/layers, see spine/character/BRIEF_layered_character.md).

Every layer is a PNG on the same canvas as the master frame. Joints are found from the art itself:
a joint is the centre of the overlap between two layers (shoulder = upper arm x body, elbow = upper x
forearm, wrist = forearm x hand, neck x body, head x neck), or the closest points when they do not
overlap. Hair, locks, bangs and the dress tail become weighted meshes on bone chains along their main
axis, with physics. Limbs, head, face parts and the bird are plain regions (eyes, mouth, hand and the
bird's wings swap pictures), so that part of the rig is what Spine Essential can show.

  /usr/bin/python3 spine/tools/make_heroine.py --check   # report missing/misaligned layers + preview
  /usr/bin/python3 spine/tools/make_heroine.py           # write spine/character/character.json + images

Optional overrides in layers/rig.json: {"bird_faces": "left"|"right", "joints": {"shoulder": [x, y], ...},
"front": ["arm_rest", ...] (layers drawn in front of the body instead of behind)}.
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rigkit import (TAU, Pose, Skeleton, back_out, bump, catmull, grid_mesh, smooth, sm, step, timelines, top4,
                    track)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = os.path.join(ROOT, "character")
# HEROINE_LAYERS / HEROINE_OUT redirect input and output (used to smoke-test the builder on stand-in art).
LAYERS = os.environ.get("HEROINE_LAYERS", os.path.join(CH, "layers"))
OUT = os.environ.get("HEROINE_OUT", CH)
IMG = os.path.join(OUT, "images")
FPS = 30
RIG_H = 1424  # skeleton height of the character (the game fits the rig's bounds, so this only sets units)

REQUIRED = ["hair_back", "body", "neck", "head", "eyes_open", "mouth_smile", "arm_up_upper", "arm_up_fore", "hand_point"]
OPTIONAL = ["cloud_back", "cloud_front", "dress_tail", "arm_rest", "eyes_half", "eyes_closed", "eyes_happy",
            "mouth_open", "mouth_o", "bangs", "lock_L", "lock_R", "strand_1", "strand_2", "strand_3", "strand_4",
            "wing_L", "wing_R", "halo", "hand_open", "hand_cheer",
            "bird_body", "bird_sit", "bird_wing_up", "bird_wing_mid", "bird_wing_down"]
BIRD = ["bird_body", "bird_sit", "bird_wing_up", "bird_wing_mid", "bird_wing_down"]
FALLBACK = {"eyes_half": ["eyes_closed", "eyes_open"], "eyes_closed": ["eyes_half", "eyes_open"],
            "eyes_happy": ["eyes_closed", "eyes_half", "eyes_open"], "mouth_open": ["mouth_smile"],
            "mouth_o": ["mouth_open", "mouth_smile"], "hand_open": ["hand_point"], "hand_cheer": ["hand_open", "hand_point"],
            "bird_sit": ["bird_body"], "bird_wing_mid": ["bird_wing_up", "bird_wing_down"],
            "bird_wing_down": ["bird_wing_mid", "bird_wing_up"], "bird_wing_up": ["bird_wing_mid", "bird_wing_down"]}


# ---------------------------------------------------------------- layers
class Layer:
    def __init__(self, name, path):
        im = Image.open(path).convert("RGBA")
        self.name, self.canvas = name, im.size
        box = im.getbbox() or (0, 0, 1, 1)
        self.x0, self.y0 = box[0], box[1]
        self.img = im.crop(box)
        self.mask = np.array(self.img.split()[3]) > 40

    @property
    def box(self):
        return (self.x0, self.y0, self.x0 + self.img.width, self.y0 + self.img.height)

    @property
    def centre(self):
        x0, y0, x1, y1 = self.box
        return ((x0 + x1) / 2, (y0 + y1) / 2)

    def points(self, stride=4):
        ys, xs = np.nonzero(self.mask[::stride, ::stride])
        return np.stack([xs * stride + self.x0, ys * stride + self.y0], axis=1).astype(float)

    def top_point(self):
        ys, xs = np.nonzero(self.mask)
        y = ys.min()
        row = xs[ys <= y + 6]
        return (float(row.mean() + self.x0), float(y + self.y0))


def load_layers():
    out = {}
    for n in REQUIRED + OPTIONAL:
        p = os.path.join(LAYERS, n + ".png")
        if os.path.exists(p):
            out[n] = Layer(n, p)
    return out


def overlap(a, b):
    ax0, ay0, ax1, ay1 = a.box
    bx0, by0, bx1, by1 = b.box
    x0, y0, x1, y1 = max(ax0, bx0), max(ay0, by0), min(ax1, bx1), min(ay1, by1)
    if x1 <= x0 or y1 <= y0:
        return None
    m = a.mask[y0 - ay0:y1 - ay0, x0 - ax0:x1 - ax0] & b.mask[y0 - by0:y1 - by0, x0 - bx0:x1 - bx0]
    ys, xs = np.nonzero(m)
    if len(xs) < 30:
        return None
    return (float(xs.mean() + x0), float(ys.mean() + y0))


def nearest(a, b):
    pa, pb = a.points(6), b.points(6)
    best = None
    for chunk in np.array_split(pa, max(1, len(pa) // 2000)):
        d = ((chunk[:, None, :] - pb[None, :, :]) ** 2).sum(-1)
        i, j = np.unravel_index(d.argmin(), d.shape)
        if best is None or d[i, j] < best[0]:
            best = (d[i, j], chunk[i], pb[j])
    return tuple(((best[1] + best[2]) / 2).tolist())


def nearest_point(layer, p):
    pts = layer.points(4)
    i = ((pts - np.array(p)) ** 2).sum(1).argmin()
    return tuple(pts[i].tolist())


def joint(a, b):
    return overlap(a, b) or nearest(a, b)


def axis(layer, root_hint):
    """Main axis of a layer (PCA): (root end nearest root_hint, tip end)."""
    pts = layer.points(3)
    m = pts.mean(0)
    w, v = np.linalg.eigh(np.cov((pts - m).T))
    d = v[:, w.argmax()]
    proj = (pts - m) @ d
    e1, e2 = m + d * proj.min(), m + d * proj.max()
    h = np.array(root_hint)
    if np.linalg.norm(e1 - h) > np.linalg.norm(e2 - h):
        e1, e2 = e2, e1
    return tuple(e1.tolist()), tuple(e2.tolist())


def lerp(a, b, k):
    return (a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k)


# ---------------------------------------------------------------- check
def check(L, out_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    missing = [n for n in REQUIRED if n not in L]
    sizes = {}
    for n, l in L.items():
        if n not in BIRD:  # the bird has its own canvas
            sizes.setdefault(l.canvas, []).append(n)
    print("layers found:", len(L), "/", len(REQUIRED + OPTIONAL))
    print("missing required:", ", ".join(missing) or "none")
    print("missing optional:", ", ".join(n for n in OPTIONAL if n not in L) or "none")
    if len(sizes) > 1:
        print("CANVAS SIZES DIFFER (all layers must share the master canvas):")
        for s, ns in sizes.items():
            print("  ", s, ":", ", ".join(ns))
    pairs = [("body", "neck"), ("neck", "head"), ("body", "arm_up_upper"), ("arm_up_upper", "arm_up_fore"),
             ("arm_up_fore", "hand_point"), ("body", "arm_rest"), ("head", "eyes_open"), ("head", "mouth_smile")]
    for a, b in pairs:
        if a in L and b in L:
            o = overlap(L[a], L[b])
            print(f"joint {a} x {b}:", "overlap ok" if o else "NO OVERLAP (joint taken from the closest points; parts may gap when moving)")
    master = os.path.join(LAYERS, "master.png")
    canvas = next(iter(sizes)) if sizes else (2048, 2560)
    comp = Image.new("RGBA", canvas, (90, 110, 150, 255))
    for _, atts in draw_order(L, {}):
        present = [a for a in atts if a in L]
        if present:
            l = L[present[0]]
            comp.alpha_composite(l.img, (l.x0, l.y0))
    if os.path.exists(master):
        m = Image.open(master).convert("RGBA").resize(canvas)
        side = Image.new("RGB", (canvas[0] * 2, canvas[1]))
        side.paste(m.convert("RGB"), (0, 0))
        side.paste(comp.convert("RGB"), (canvas[0], 0))
        side.thumbnail((1600, 1600))
        side.save(out_path)
    else:
        comp.convert("RGB").resize((canvas[0] // 3, canvas[1] // 3)).save(out_path)
    print("preview:", out_path)
    return not missing and len(sizes) <= 1


def draw_order(L, cfg):
    front = set(cfg.get("front", []))
    back = ["cloud_back", "hair_back", "strand_1", "strand_2", "strand_3", "strand_4", "dress_tail", "wing_L", "halo"]
    order = [(n, [n]) for n in back]
    if "arm_rest" not in front:
        order.append(("arm_rest", ["arm_rest"]))
    order += [("body", ["body"]), ("cloud_front", ["cloud_front"])]
    if "arm_rest" in front:
        order.append(("arm_rest", ["arm_rest"]))
    order += [("neck", ["neck"]), ("head", ["head"]),
              ("eyes", ["eyes_open", "eyes_half", "eyes_closed", "eyes_happy"]),
              ("mouth", ["mouth_smile", "mouth_open", "mouth_o"]),
              ("lock_L", ["lock_L"]), ("lock_R", ["lock_R"]), ("bangs", ["bangs"]), ("wing_R", ["wing_R"]),
              ("arm_up_upper", ["arm_up_upper"]), ("arm_up_fore", ["arm_up_fore"]),
              ("hand_up", ["hand_point", "hand_open", "hand_cheer"])]
    return order


# ---------------------------------------------------------------- rig
def build(L, cfg):
    canvas = L["body"].canvas
    char = [l for n, l in L.items() if not n.startswith("bird")]
    x0 = min(l.box[0] for l in char); x1 = max(l.box[2] for l in char)
    y0 = min(l.box[1] for l in char); y1 = max(l.box[3] for l in char)
    k = RIG_H / (y1 - y0)
    cx = (x0 + x1) / 2

    def S(p):
        return ((p[0] - cx) * k, (y1 - p[1]) * k)

    def P(s):
        return (s[0] / k + cx, y1 - s[1] / k)

    J = {kk: tuple(v) for kk, v in cfg.get("joints", {}).items()}

    def j(name, fn):
        if name not in J:
            J[name] = fn()
        return J[name]

    neck_j = j("neck", lambda: joint(L["neck"], L["body"]))
    head_j = j("head", lambda: joint(L["head"], L["neck"]))
    # Hips: ~42 % of the way from the neck to her lowest point (sitting pose), snapped onto the body.
    seat = j("seat", lambda: nearest_point(L["body"], (neck_j[0], neck_j[1] + 0.42 * (L["body"].box[3] - neck_j[1]))))
    waist = lerp(seat, neck_j, 0.45)
    shoulder = j("shoulder", lambda: joint(L["arm_up_upper"], L["body"]))
    elbow = j("elbow", lambda: joint(L["arm_up_upper"], L["arm_up_fore"]))
    wrist = j("wrist", lambda: joint(L["arm_up_fore"], L["hand_point"]))
    perch = j("perch", lambda: L["hand_point"].top_point())
    head_c = L["head"].centre
    head_h = L["head"].box[3] - L["head"].box[1]
    head_tip = lerp(head_j, head_c, 2.0)

    sk = Skeleton()
    sk.bone("root")
    sk.bone("char", "root")
    if "cloud_back" in L or "cloud_front" in L:
        c = (L.get("cloud_back") or L["cloud_front"]).centre
        sk.bone("cloud", "char", S(c))
    sk.bone("hips", "char", S(seat), S(waist))
    sk.bone("chest", "hips", S(waist), S(neck_j))
    sk.bone("neck", "chest", S(neck_j), S(head_j))
    sk.bone("head", "neck", S(head_j), S(head_tip))
    sk.bone("face", "head", S(L["eyes_open"].centre))
    sk.bone("arm_up", "chest", S(shoulder), S(elbow))
    sk.bone("fore_up", "arm_up", S(elbow), S(wrist))
    sk.bone("hand_up", "fore_up", S(wrist), S(perch))
    sk.bone("perch", "hand_up", S(perch))
    if "arm_rest" in L:
        sh = j("rest_shoulder", lambda: joint(L["arm_rest"], L["body"]))
        sk.bone("arm_rest", "chest", S(sh), S(axis(L["arm_rest"], sh)[1]))
    for w in ("wing_L", "wing_R"):
        if w in L:
            sk.bone(w, "head", S(j(w, lambda w=w: joint(L[w], L["head"]))))
    if "halo" in L:
        sk.bone("halo", "head", S(L["halo"].centre))

    chains = {}  # layer -> (bones, root P, tip P)

    def chain(name, n, root_hint, first_parent, rest_parent):
        root, tip = axis(L[name], root_hint)
        bones = []
        for i in range(n):
            a, b = lerp(root, tip, i / n), lerp(root, tip, (i + 1) / n)
            par = first_parent if i == 0 else (rest_parent or bones[-1])
            bones.append(sk.bone(f"{name}{i + 1}", par, S(a), S(b)))
        chains[name] = (bones, root, tip)

    if "hair_back" in L:
        chain("hair_back", 3, head_c, "head", "chest")
    for n in ("strand_1", "strand_2", "strand_3", "strand_4"):
        if n in L:
            chain(n, 3, head_c, "head", None)
    for n in ("lock_L", "lock_R"):
        if n in L:
            chain(n, 2, head_c, "head", None)
    if "bangs" in L:
        chain("bangs", 1, (head_c[0], L["head"].box[1]), "head", None)
    if "dress_tail" in L:
        chain("dress_tail", 2, seat, "hips", None)

    # The bird: its pictures share their own canvas; it is scaled to ~0.38 of the head height.
    bird = None
    if "bird_body" in L:
        sit = L.get("bird_sit") or L["bird_body"]
        feet = (sit.centre[0], sit.box[3])
        kb = 0.38 * head_h / (sit.box[3] - sit.box[1])
        bird = {"feet": feet, "kb": kb, "faces": cfg.get("bird_faces", "left")}
        sk.bone("bird", "char", S(perch))
    for n in ("trail1", "trail2", "burst1", "burst2", "burst3", "burst4"):
        sk.bone(n, "bird" if (bird and n.startswith("burst")) else "char", S(perch))
    return sk, S, P, k, chains, bird, dict(neck=neck_j, head=head_j, seat=seat, waist=waist, shoulder=shoulder,
                                           elbow=elbow, wrist=wrist, perch=perch, head_c=head_c, head_h=head_h)


def chain_weights(sk, bones, root, tip, p):
    vx, vy = tip[0] - root[0], tip[1] - root[1]
    L2 = vx * vx + vy * vy
    s = ((p[0] - root[0]) * vx + (p[1] - root[1]) * vy) / L2 * len(bones)
    w = {}
    for i, b in enumerate(bones):
        c = i + 0.5
        v = 1 - abs(s - c) / 0.75
        if (i == 0 and s < c) or (i == len(bones) - 1 and s > c):
            v = 1
        if v > 0:
            w[b] = v
    return top4(w)


def body_weights(J, p):
    ax, ay = J["neck"][0] - J["seat"][0], J["neck"][1] - J["seat"][1]
    t = ((p[0] - J["seat"][0]) * ax + (p[1] - J["seat"][1]) * ay) / (ax * ax + ay * ay)
    c = smooth(0.35, 0.75, t)
    return top4({"hips": 1 - c, "chest": c})


# ---------------------------------------------------------------- choreography
CYAN, GOLD, WHITE = (0x8f, 0xe9, 0xff), (0xff, 0xe2, 0x7a), (0xff, 0xff, 0xff)


class Heroine:
    def __init__(self, L, sk, S, P, k, chains, bird, J):
        self.L, self.sk, self.S, self.P, self.k, self.chains, self.bird, self.J = L, sk, S, P, k, chains, bird, J
        self.have = set(L)
        # Which way leans "toward the board" (her left on screen): probe the rig.
        self.lean_sign = self._sign("chest", lambda p0, p1: p0[0] - p1[0], "head")
        # Arm gestures are wrist targets reached with 2-bone IK; the elbow keeps the drawing's bend side.
        sh, el, wr = (sk.world[b][:2] for b in ("arm_up", "fore_up", "hand_up"))
        self.l1, self.l2 = math.dist(sh, el), math.dist(el, wr)
        self.bend = 1.0 if ((wr[0] - sh[0]) * (el[1] - sh[1]) - (wr[1] - sh[1]) * (el[0] - sh[0])) >= 0 else -1.0
        out = 1.0 if J["shoulder"][0] >= J["neck"][0] else -1.0  # the raised arm's side of the body (P x)
        hc, hh = J["head_c"], J["head_h"]
        self.targets = {"cheer": S((hc[0] + out * 0.55 * hh, hc[1] - 1.05 * hh)),
                        "board": S((hc[0] - 1.2 * hh, hc[1] + 0.1 * hh))}

    def _sign(self, bone, gain, probe):
        p0 = self.sk.pos(Pose(), probe)
        pose = Pose()
        pose.add(bone, r=8)
        p1 = self.sk.pos(pose, probe)
        return 1.0 if gain(p0, p1) >= 0 else -1.0

    def pick(self, name):
        if name in self.have:
            return name
        for f in FALLBACK.get(name, []):
            if f in self.have:
                return f
        return None

    # -- layers of motion
    def life(self, p, t, b=3.0, s=6.0, h=3.0, e=1.0):
        sb, ss = math.sin(TAU * t / b), math.sin(TAU * t / s)
        p.add("hips", y=8 * e * math.sin(TAU * t / b + 0.6), r=0.8 * e * ss)
        p.add("chest", r=1.6 * e * math.sin(TAU * t / s - 0.7), sx=1 + 0.008 * sb, sy=1 + 0.016 * sb)
        p.add("neck", r=-0.8 * e * ss)
        p.add("head", r=2.4 * e * math.sin(TAU * t / s - 1.3))
        p.add("arm_up", r=1.2 * e * math.sin(TAU * t / b + 0.5))
        p.add("fore_up", r=1.0 * math.sin(TAU * t / b + 1.0))
        p.add("hand_up", r=1.4 * math.sin(TAU * t / b + 1.6))
        if "arm_rest" in self.sk.world:
            p.add("arm_rest", r=0.6 * math.sin(TAU * t / b + 0.2))
        for name, (bones, _, _) in self.chains.items():
            amp = {"hair_back": 1.6, "dress_tail": 2.2, "bangs": 1.2}.get(name, 2.6)
            ph = sum(map(ord, name)) % 7
            for i, bn in enumerate(bones):
                p.add(bn, r=amp * (1 + 0.5 * i) * e * math.sin(TAU * t / h - 0.9 * i + ph))
        for w, sgn in (("wing_L", 1), ("wing_R", -1)):
            if w in self.sk.world:
                p.add(w, r=sgn * 3 * e * math.sin(TAU * t / (b / 2)))
        if "halo" in self.sk.world:
            p.add("halo", r=1.5 * ss, y=5 * math.sin(TAU * t / b + 1.2))
        if "cloud" in self.sk.world:
            q = 1 + 0.02 * math.sin(TAU * t / b + 2.0)
            p.add("cloud", y=4 * math.sin(TAU * t / b + 1.5), sx=q, sy=2 - q)

    def reach(self, p, target_s, blend):
        """Blend the arm toward putting the wrist on target_s (skeleton space)."""
        if blend <= 0:
            return
        W = self.sk.fk(p)
        pa = W["chest"]
        chest_rot = math.degrees(math.atan2(pa[2], pa[0]))
        sx, sy = W["arm_up"][4], W["arm_up"][5]
        tx, ty = target_s
        d = min(max(math.dist((sx, sy), (tx, ty)), abs(self.l1 - self.l2) + 1e-3), self.l1 + self.l2 - 1e-3)
        base = math.atan2(ty - sy, tx - sx)
        off = math.acos(max(-1.0, min(1.0, (self.l1 ** 2 + d ** 2 - self.l2 ** 2) / (2 * self.l1 * d))))
        a1 = base - self.bend * off
        ex, ey = sx + self.l1 * math.cos(a1), sy + self.l1 * math.sin(a1)
        a2 = math.atan2(ty - ey, tx - ex)

        def wrap(a):
            return (a + 180) % 360 - 180
        up_off = wrap(math.degrees(a1) - chest_rot - self.sk.local["arm_up"][2])
        fore_off = wrap(math.degrees(a2 - a1) - self.sk.local["fore_up"][2])
        for bone, v in (("arm_up", up_off), ("fore_up", fore_off)):
            e = p.setdefault(bone, [0.0, 0.0, 0.0, 1.0, 1.0])
            e[0] += (v - e[0]) * blend

    def raise_arm(self, p, up, fore=None, hand=0.0, target="cheer"):
        """up: 0..45 = how far toward the gesture (45 = all the way)."""
        self.reach(p, self.targets[target], max(0.0, min(1.0, up / 45.0)))
        if up < 0:  # a small wind-up below the rest pose
            p.add("arm_up", r=up * 0.5 * self.bend)
        p.add("hand_up", r=hand)

    def lean(self, p, deg):
        p.add("chest", r=self.lean_sign * deg)
        p.add("hips", r=self.lean_sign * deg * 0.3)

    def look(self, p, target_P):
        hx = self.J["head_c"][0]
        a = max(-6.0, min(6.0, (hx - target_P[0]) / (0.9 * self.J["head_h"]) * 6.0))
        p.add("head", r=a)
        p.add("neck", r=0.3 * a)

    def flutter(self, p, t, env, amp=10, hz=6):
        for w, sgn in (("wing_L", 1), ("wing_R", -1)):
            if w in self.sk.world and env > 0:
                p.add(w, r=sgn * amp * env * math.sin(TAU * hz * t))

    # -- the bird
    def perch_P(self, pose):
        return self.P(self.sk.pos(pose, "perch"))

    def around_head(self, th, r=1.0):
        c = (self.J["head_c"][0], self.J["head_c"][1] - 0.2 * self.J["head_h"])
        return (c[0] + 1.05 * r * self.J["head_h"] * math.cos(th), c[1] - 0.7 * r * self.J["head_h"] * math.sin(th))

    def bird_frame(self, t, pose, pos, flying, swaps, slots, vx=0.0):
        if not self.bird:
            return
        s, s0 = self.S(pos), self.sk.world["bird"]
        flip = 1.0
        if flying and abs(vx) > 1e-3:
            moving_right = vx > 0
            flip = -1.0 if (moving_right == (self.bird["faces"] == "left")) else 1.0
        pose.add("bird", x=s[0] - s0[0], y=s[1] - s0[1], sx=flip)
        if flying:
            frames = ["bird_wing_up", "bird_wing_mid", "bird_wing_down", "bird_wing_mid"]
            swaps["bird_body"] = self.pick("bird_body")
            swaps["bird_wing"] = self.pick(frames[int(t * 14) % 4])
        else:
            swaps["bird_body"] = self.pick("bird_sit")
            swaps["bird_wing"] = None

    def blink(self, t, times):
        for tb in times:
            d = t - tb
            if 0 <= d < 0.04 or 0.12 <= d < 0.16:
                return "eyes_half"
            if 0.04 <= d < 0.12:
                return "eyes_closed"
        return None


def add_trails(frames, times, loop, S0):
    n = len(frames) - 1
    for i, f in enumerate(frames):
        pose, slots, swaps, s = f
        for kk, lag in ((1, 2), (2, 4)):
            jj = (i - lag) % n if loop else max(0, i - lag)
            ps = frames[jj][3]
            speed = math.hypot(s[0] - ps[0], s[1] - ps[1]) * FPS / lag
            a = max(0.0, min(0.7, (speed - 300) / 1500))
            pose.add(f"trail{kk}", x=ps[0] - S0[0], y=ps[1] - S0[1], sx=0.6 - 0.15 * kk, sy=0.6 - 0.15 * kk)
            slots[f"trail{kk}"] = (GOLD, a * (1.0 - 0.3 * kk))


def bursts(slots, pose, t, starts, dist=160, dur=0.45):
    best = (0.0, 0.0)
    for t0 in starts:
        if t0 <= t < t0 + dur:
            d = (t - t0) / dur
            best = max(best, (math.sin(math.pi * d), back_out(d)))
    a, d = best
    for kk in range(4):
        ang = math.radians(45 + 90 * kk)
        pose.add(f"burst{kk + 1}", x=dist * d * math.cos(ang), y=dist * d * math.sin(ang), r=180 * d,
                 sx=max(0.01, 0.6 * a), sy=max(0.01, 0.6 * a))
        slots[f"burst{kk + 1}"] = (WHITE, a)


def animations(H):
    """name -> (duration, loop, frame(t) -> (pose, slots, swaps, bird P, flying))."""
    J = H.J
    hh = J["head_h"]

    def base(t, per=(3.0, 6.0, 3.0), e=1.0):
        p = Pose()
        H.life(p, t, *per, e=e)
        return p

    def landed(t, p, lift=0.0):
        x, y = H.perch_P(p)
        return (x, y - lift - 0.03 * hh * max(0.0, math.sin(TAU * t / 0.75)))

    A = {}

    # idle_01 (6 s): bird on her finger, flies a loop around her head, lands again (the reference's cycle).
    def idle_body(t):
        p = base(t)
        H.raise_arm(p, track(t, [(0, 0), (1.3, 0), (1.45, -3), (1.6, 6), (2.0, 0), (4.7, 0), (5.0, 4), (5.4, 0), (6, 0)]))
        H.flutter(p, t, bump(t, 2.0, 3.6))
        return p

    go = [(1.5, landed(1.5, idle_body(1.5))), (1.9, H.around_head(-0.3, 1.1)), (2.4, H.around_head(0.6)),
          (2.9, H.around_head(1.6)), (3.4, H.around_head(2.6)), (3.9, H.around_head(3.5, 0.9)),
          (4.4, H.around_head(4.6, 1.1)), (5.05, landed(5.05, idle_body(5.05)))]

    def idle_01(t):
        p = idle_body(t)
        flying = 1.5 <= t < 5.05
        if flying:
            pos = catmull(t, go)
            prev = catmull(max(1.5, t - 0.05), go)
        else:
            pos, prev = landed(t, p), landed(t, p)
        H.look(p, pos)
        swaps = {"eyes": H.pick(H.blink(t, [0.8, 3.3]) or "eyes_open"),
                 "mouth": H.pick("mouth_open" if bump(t, 5.05, 5.6, 0.05) > 0.5 else "mouth_smile"),
                 "hand_up": H.pick("hand_point")}
        slots = {}
        H.bird_frame(t, p, pos, flying, swaps, slots, pos[0] - prev[0])
        return p, slots, swaps, pos, flying
    A["idle_01"] = (6.0, True, idle_01)

    # idle_02 (6 s): she talks to the bird on her finger; it hops and flutters in place.
    def idle_02(t):
        p = base(t)
        H.raise_arm(p, track(t, [(0, 0), (0.8, 4), (2.6, 4), (3.2, 0), (6, 0)]))
        p.add("head", r=track(t, [(0, 0), (0.8, 3), (2.6, 3), (3.4, 0), (6, 0)]))
        hop = 0.25 * hh * max(bump(t, 1.2, 1.55, 0.12), bump(t, 3.8, 4.15, 0.12))
        flutter = bump(t, 4.6, 5.4, 0.15)
        pos = landed(t, p, lift=hop + 0.35 * hh * flutter)
        H.look(p, pos)
        talk = (int(t * 7) % 2 == 0) and (0.9 <= t < 2.3)
        swaps = {"eyes": H.pick(H.blink(t, [0.5, 3.0, 3.25]) or ("eyes_happy" if 4.6 < t < 5.4 else "eyes_open")),
                 "mouth": H.pick("mouth_o" if talk else ("mouth_open" if 4.6 < t < 5.4 else "mouth_smile")),
                 "hand_up": H.pick("hand_point")}
        slots = {}
        H.bird_frame(t, p, pos, flutter > 0.2 or hop > 0.05 * hh, swaps, slots)
        return p, slots, swaps, pos, False
    A["idle_02"] = (6.0, True, idle_02)

    def reaction(dur, body, eyes, mouth, hand, bird_lift, flying_when, extra=None, per=(3.0, 6.0, 3.0), e=1.0, bird_pos=None):
        def f(t):
            p = base(t, per, e)
            body(t, p)
            pos = bird_pos(t, p) if bird_pos else landed(t, p, lift=bird_lift(t) * hh)
            prev = bird_pos(max(0.0, t - 0.05), p) if bird_pos else pos
            H.look(p, pos)
            swaps = {"eyes": H.pick(eyes(t)), "mouth": H.pick(mouth(t)), "hand_up": H.pick(hand(t))}
            slots = {}
            H.bird_frame(t, p, pos, flying_when(t), swaps, slots, pos[0] - prev[0])
            if extra:
                extra(t, p, slots)
            return p, slots, swaps, pos, flying_when(t)
        return (dur, False, f)

    A["spin_ack"] = reaction(0.5,
        lambda t, p: (H.lean(p, track(t, [(0, 0), (0.15, 2), (0.5, 0)])), p.add("hips", y=track(t, [(0, 0), (0.12, -5), (0.35, 1), (0.5, 0)]))),
        lambda t: "eyes_open", lambda t: "mouth_smile", lambda t: "hand_point",
        lambda t: 0.3 * math.sin(math.pi * min(1, max(0, (t - 0.05) / 0.4))), lambda t: 0.08 < t < 0.4)

    A["cascade_continue"] = reaction(0.4,
        lambda t, p: (p.add("hips", y=track(t, [(0, 0), (0.12, 9), (0.4, 0)])), p.add("head", r=track(t, [(0, 0), (0.15, 2), (0.4, 0)]))),
        lambda t: "eyes_happy" if t < 0.3 else "eyes_open", lambda t: "mouth_open" if t < 0.3 else "mouth_smile",
        lambda t: "hand_point", lambda t: 0.2 * math.sin(math.pi * min(1, t / 0.4)), lambda t: 0.05 < t < 0.35,
        lambda t, p, s: bursts(s, p, t, [0.08], dist=110, dur=0.3))

    A["small_win"] = reaction(0.8,
        lambda t, p: (p.add("hips", y=track(t, [(0, 0), (0.2, 18), (0.5, 0), (0.62, 4), (0.8, 0)])),
                      H.raise_arm(p, track(t, [(0, 0), (0.25, 10), (0.8, 0)])), H.flutter(p, t, bump(t, 0.1, 0.6, 0.1), 12, 7)),
        lambda t: "eyes_happy" if 0.1 < t < 0.65 else "eyes_open", lambda t: "mouth_open" if 0.08 < t < 0.65 else "mouth_smile",
        lambda t: "hand_point", lambda t: 0.9 * math.sin(math.pi * min(1, t / 0.75)), lambda t: 0.05 < t < 0.72,
        lambda t, p, s: bursts(s, p, t, [0.25]))

    A["medium_win"] = reaction(1.1,
        lambda t, p: (p.add("hips", y=track(t, [(0, 0), (0.25, 22), (0.6, 0), (0.75, 6), (1.1, 0)])),
                      H.raise_arm(p, track(t, [(0, 0), (0.3, 22), (0.8, 22), (1.1, 0)]), hand=track(t, [(0, 0), (0.3, 8), (1.1, 0)])),
                      H.flutter(p, t, bump(t, 0.15, 0.9, 0.15), 14, 7)),
        lambda t: "eyes_happy" if 0.1 < t < 0.9 else "eyes_open", lambda t: "mouth_open" if 0.1 < t < 0.9 else "mouth_smile",
        lambda t: "hand_cheer" if 0.15 < t < 0.85 else "hand_point", lambda t: 1.6 * math.sin(math.pi * min(1, t / 1.0)),
        lambda t: 0.05 < t < 0.98, lambda t, p, s: bursts(s, p, t, [0.45], dist=180))

    A["anticipation"] = reaction(1.5,
        lambda t, p: (H.lean(p, track(t, [(0, 0), (0.5, 4)])), p.add("head", r=H.lean_sign * track(t, [(0, 0), (0.6, 4)])),
                      H.raise_arm(p, track(t, [(0, 0), (0.5, 18)]), target="board"), H.flutter(p, t, track(t, [(0, 0), (0.4, 0.6)]), 6, 8)),
        lambda t: "eyes_open", lambda t: "mouth_o" if t > 0.25 else "mouth_smile", lambda t: "hand_open" if t > 0.3 else "hand_point",
        lambda t: track(t, [(0, 0), (0.5, 0.45)]) + 0.04 * math.sin(TAU * 9 * t), lambda t: t > 0.3, e=1.2)

    top = H.around_head(math.pi / 2, 1.6)

    def trig_bird(t, p):
        if t < 0.3:
            return landed(t, p)
        return catmull(t, [(0.3, landed(0.3, p)), (0.55, H.around_head(0.4, 1.2)), (0.75, top), (1.0, H.around_head(1.2, 1.3)),
                           (1.5, H.around_head(0.0, 1.3))])

    A["feature_trigger"] = reaction(1.5,
        lambda t, p: (p.add("hips", y=track(t, [(0, 0), (0.22, -8), (0.55, 28), (0.9, 6), (1.5, 0)])),
                      H.raise_arm(p, track(t, [(0, 0), (0.22, -4), (0.55, 45), (0.9, 38), (1.5, 10)]), hand=track(t, [(0, 0), (0.55, 12), (1.5, 0)])),
                      p.add("head", r=-H.lean_sign * track(t, [(0, 0), (0.55, 4), (1.5, 0)])), H.flutter(p, t, bump(t, 0.3, 1.2, 0.15), 14, 7)),
        lambda t: "eyes_happy" if 0.45 < t < 1.2 else "eyes_open", lambda t: "mouth_open" if 0.4 < t < 1.3 else "mouth_smile",
        lambda t: "hand_cheer" if 0.35 < t < 1.2 else "hand_open", lambda t: 0.0, lambda t: t >= 0.3,
        lambda t, p, s: (bursts(s, p, t, [0.75], dist=240, dur=0.55),
                         s.__setitem__("halo_glow", ((0xff, 0xe9, 0xa0), track(t, [(0, 0.2), (0.6, 1.0), (1.5, 0.6)])))),
        per=(1.5, 3.0, 1.5), e=1.3, bird_pos=trig_bird)

    def feature_idle(t):
        p = base(t, (1.5, 3.0, 1.5), e=1.6)
        H.raise_arm(p, 10)
        H.flutter(p, t, 1.0, 5, 3)
        pos = H.around_head(TAU * t / 3.0, 1.3)
        prev = H.around_head(TAU * (t - 0.05) / 3.0, 1.3)
        H.look(p, pos)
        swaps = {"eyes": H.pick(H.blink(t, [1.1]) or "eyes_open"), "mouth": H.pick("mouth_smile"), "hand_up": H.pick("hand_open")}
        slots = {"halo_glow": ((0xff, 0xe9, 0xa0), 0.6 + 0.2 * math.sin(TAU * t / 1.5))}
        H.bird_frame(t, p, pos, True, swaps, slots, pos[0] - prev[0])
        return p, slots, swaps, pos, True
    A["feature_idle"] = (3.0, True, feature_idle)

    def big_bird(t, p):
        if t < 0.3 or t >= 2.1:
            return landed(t, p)
        if t < 1.7:
            return H.around_head(0.8 + 2 * TAU * (t - 0.3) / 1.4, 1.35)
        return catmull(t, [(1.7, H.around_head(0.8 + 2 * TAU, 1.35)), (2.1, landed(2.1, p))])

    A["big_win"] = reaction(2.2,
        lambda t, p: (p.add("hips", y=track(t, [(0, 0), (0.25, 24), (0.5, 0), (0.75, 28), (1.05, 0), (1.2, 5), (1.45, 0)])),
                      H.raise_arm(p, track(t, [(0, 0), (0.35, 45), (1.4, 45), (2.0, 0)]), hand=track(t, [(0, 0), (0.35, 12), (1.4, 12), (2.0, 0)])),
                      p.add("head", r=-H.lean_sign * track(t, [(0, 0), (0.4, 5), (1.4, 5), (2.0, 0)])), H.flutter(p, t, bump(t, 0.2, 1.6, 0.2), 14, 7)),
        lambda t: "eyes_happy" if 0.25 < t < 1.6 else "eyes_open", lambda t: "mouth_open" if 0.2 < t < 1.7 else "mouth_smile",
        lambda t: "hand_cheer" if 0.25 < t < 1.6 else "hand_point", lambda t: 0.0, lambda t: 0.3 <= t < 2.1,
        lambda t, p, s: (bursts(s, p, t, [0.5, 1.0, 1.5], dist=190),
                         s.__setitem__("halo_glow", ((0xff, 0xe9, 0xa0), track(t, [(0, 0.0), (0.4, 1.0), (1.6, 1.0), (2.2, 0.0)])))),
        e=1.3, bird_pos=big_bird)

    A["settle_to_idle"] = reaction(0.7,
        lambda t, p: H.raise_arm(p, track(t, [(0, 10), (0.7, 0)])),
        lambda t: "eyes_open", lambda t: "mouth_smile", lambda t: "hand_open" if t < 0.4 else "hand_point",
        lambda t: 0.0, lambda t: t < 0.6,
        bird_pos=lambda t, p: catmull(t, [(0, H.around_head(0.0, 1.3)), (0.6, landed(0.6, p))]) if t < 0.6 else landed(t, p))
    return A


# ---------------------------------------------------------------- write
def main():
    L = load_layers()
    cfg = json.load(open(os.path.join(LAYERS, "rig.json"))) if os.path.exists(os.path.join(LAYERS, "rig.json")) else {}
    if "--check" in sys.argv:
        ok = check(L, os.path.join(OUT, "layers_check.png"))
        sys.exit(0 if ok else 1)
    missing = [n for n in REQUIRED if n not in L]
    if missing:
        sys.exit("missing layers: " + ", ".join(missing))
    sk, S, P, k, chains, bird, J = build(L, cfg)
    H = Heroine(L, sk, S, P, k, chains, bird, J)

    os.makedirs(IMG, exist_ok=True)
    for f in os.listdir(IMG):
        if f.endswith(".png"):
            os.remove(os.path.join(IMG, f))
    for n, l in L.items():
        l.img.save(os.path.join(IMG, n + ".png"))

    def radial(name, profile):
        a = Image.new("L", (128, 128))
        a.putdata([int(255 * profile(min(1.0, math.hypot(x - 63.5, y - 63.5) / 64))) for y in range(128) for x in range(128)])
        Image.merge("RGBA", (Image.new("L", (128, 128), 255),) * 3 + (a,)).save(os.path.join(IMG, name + ".png"))
    radial("fx_soft", lambda r: max(0.0, 1 - r) ** 1.8)
    Image.open(os.path.join(ROOT, "screens", "images", "spark.png")).save(os.path.join(IMG, "fx_spark.png"))

    def region(n, bone, scale=1.0, centre=None):
        l = L[n]
        c = centre or l.centre
        lx, ly = sk.bind(bone, S(c))
        br = sk.world[bone][2]
        a = {"x": round(lx, 2), "y": round(ly, 2), "width": round(l.img.width * k * scale, 2), "height": round(l.img.height * k * scale, 2)}
        if abs(br) > 1e-3:
            a["rotation"] = round(-br, 3)
        return a

    slots, skin, setup_att = [], {}, {}
    order = draw_order(L, cfg)
    meshes = {"body": lambda p: body_weights(J, p)}
    for name, (bones, root, tip) in chains.items():
        meshes[name] = (lambda b, r, t: (lambda p: chain_weights(sk, b, r, t, p)))(bones, root, tip)
    bone_of = {"cloud_back": "cloud", "cloud_front": "cloud", "arm_rest": "arm_rest", "neck": "neck", "head": "head",
               "eyes": "face", "mouth": "face", "wing_L": "wing_L", "wing_R": "wing_R", "halo": "halo",
               "arm_up_upper": "arm_up", "arm_up_fore": "fore_up", "hand_up": "hand_up"}
    for slot, atts in order:
        present = [a for a in atts if a in L]
        if not present:
            continue
        if slot in meshes:
            l = L[slot]
            skin[slot] = {slot: grid_mesh(sk, l.img, l.x0, l.y0, S, 40, meshes[slot], k)}
            slots.append({"name": slot, "bone": "hips" if slot == "body" else chains[slot][0][0], "attachment": slot})
        else:
            bone = bone_of[slot]
            skin[slot] = {a: region(a, bone) for a in present}
            slots.append({"name": slot, "bone": bone, "attachment": present[0]})
        setup_att[slot] = present[0]
        if slot == "halo":
            slots.append({"name": "halo_glow", "bone": "halo", "color": "ffe9a000", "attachment": "fx_soft", "blend": "additive"})
            hw = L["halo"].img.width * k
            skin["halo_glow"] = {"fx_soft": {"width": 128, "height": 128, "scaleX": round(1.5 * hw / 128, 3), "scaleY": round(0.8 * hw / 128, 3)}}
    for n in ("trail2", "trail1"):
        slots.append({"name": n, "bone": n, "color": "ffffff00", "attachment": "fx_soft", "blend": "additive"})
        skin[n] = {"fx_soft": {"width": 128, "height": 128, "scaleX": round(0.5 * J["head_h"] * k / 128, 3), "scaleY": round(0.5 * J["head_h"] * k / 128, 3)}}
    if bird:
        kb, feet = bird["kb"], bird["feet"]

        def bird_region(n):
            l = L[n]
            c = l.centre
            return {"x": round((c[0] - feet[0]) * kb * k, 2), "y": round((feet[1] - c[1]) * kb * k, 2),
                    "width": round(l.img.width * kb * k, 2), "height": round(l.img.height * kb * k, 2)}
        body_atts = [n for n in ("bird_sit", "bird_body") if n in L]
        wing_atts = [n for n in ("bird_wing_up", "bird_wing_mid", "bird_wing_down") if n in L]
        slots.append({"name": "bird_body", "bone": "bird", "attachment": body_atts[0]})
        skin["bird_body"] = {n: bird_region(n) for n in body_atts}
        setup_att["bird_body"] = body_atts[0]
        if wing_atts:
            slots.append({"name": "bird_wing", "bone": "bird"})
            skin["bird_wing"] = {n: bird_region(n) for n in wing_atts}
            setup_att["bird_wing"] = None
    for kk in range(1, 5):
        slots.append({"name": f"burst{kk}", "bone": f"burst{kk}", "color": "ffffff00", "attachment": "fx_spark", "blend": "additive"})
        skin[f"burst{kk}"] = {"fx_spark": {"width": 128, "height": 128}}

    phys = []
    for name, (bones, _, _) in chains.items():
        loose = {"hair_back": (90, 0.85), "dress_tail": (60, 0.8), "bangs": (110, 0.85)}.get(name, (55, 0.8))
        for i, b in enumerate(bones):
            if name == "hair_back" and i == 0:
                continue
            phys.append({"type": "physics", "name": f"phys_{b}", "bone": b, "rotate": 1, "inertia": 0.6,
                         "strength": max(30, loose[0] - 12 * i), "damping": loose[1], "mass": 1, "fps": 60})
    for w in ("wing_L", "wing_R"):
        if w in sk.world:
            phys.append({"type": "physics", "name": f"phys_{w}", "bone": w, "rotate": 1, "inertia": 0.5, "strength": 140,
                         "damping": 0.7, "mass": 1, "fps": 60})

    setup_alpha = {s["name"]: 0.0 for s in slots if s.get("color", "ff").endswith("00")}
    anims = {}
    S0 = sk.world["bird"][:2] if bird else (0, 0)
    for name, (dur, loop, f) in animations(H).items():
        n = int(round(dur * FPS))
        times = [i / FPS for i in range(n + 1)]
        frames = []
        for t in times:
            pose, sl, swaps, pos, flying = f(t)
            frames.append((pose, sl, swaps, S(pos)))
        add_trails(frames, times, loop, S0)
        if loop:
            frames[-1] = frames[0]
        anims[name] = timelines(times, [(a, b, c) for a, b, c, _ in frames], setup_alpha, setup_att)

    xs = [S((x, 0))[0] for l in L.values() if not l.name.startswith("bird") for x in (l.box[0], l.box[2])]
    skel = {
        "skeleton": {"hash": "sky-drop-heroine-layered", "spine": "4.3.26", "x": round(min(xs), 1), "y": 0,
                     "width": round(max(xs) - min(xs), 1), "height": RIG_H, "fps": FPS, "images": "./images/"},
        "bones": sk.json(), "slots": slots, "constraints": phys,
        "skins": [{"name": "default", "attachments": skin}], "animations": anims,
    }
    path = os.path.join(OUT, "character.json")
    with open(path, "w") as fo:
        json.dump(skel, fo, separators=(",", ":"))
    print(f"character.json {os.path.getsize(path) // 1024} KB, {len(sk.order)} bones, {len(slots)} slots, joints:",
          {kk: tuple(round(v) for v in J[kk]) for kk in ("seat", "neck", "head", "shoulder", "elbow", "wrist", "perch")},
          "elbow bend", H.bend, "lean sign", H.lean_sign)


if __name__ == "__main__":
    main()
