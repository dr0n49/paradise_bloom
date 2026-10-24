"""Generate the chest and frame Spine 4.3 rigs (JSON) from the art in spine/<rig>/images.
Run with /usr/bin/python3 (needs PIL); then import with the Spine CLI (see make_rigs.sh)."""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def size(rig, name):
    # Masters (full size) live in <rig>/src when present; images/ may hold scaled copies.
    src = os.path.join(ROOT, rig, "src", name + ".png")
    path = src if os.path.exists(src) else os.path.join(ROOT, rig, "images", name + ".png")
    with Image.open(path) as im:
        return im.size


def scaled_copies(rig, factor, keep_small=200):
    """Write images/ from src/ at `factor` (small images stay full size)."""
    src_dir = os.path.join(ROOT, rig, "src"); out = os.path.join(ROOT, rig, "images")
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(src_dir):
        if not f.endswith(".png"): continue
        im = Image.open(os.path.join(src_dir, f))
        if max(im.size) > keep_small:
            im = im.resize((max(1, round(im.width * factor)), max(1, round(im.height * factor))), Image.LANCZOS)
        im.save(os.path.join(out, f))

def k(t, **v):
    d = {"time": round(t, 4)} if t else {}
    d.update(v)
    return d

def rgba(t, a, rgb="ffffff"):
    return k(t, color=f"{rgb}{int(round(a * 255)):02x}")

# ---------------------------------------------------------------- chest
# Optional third picture for an unlocked (ready to open) chest, e.g. the glowing lotus bud.
READY = ("chest_ready",) if os.path.exists(os.path.join(ROOT, "chest", "images", "chest_ready.png")) else ()


def chest():
    cw, chh = size("chest", "chest_closed")
    gw, gh = size("chest", "glow")
    rw, rh = size("chest", "ring")
    skel = {
        "skeleton": {"hash": "sky-drop-chest", "spine": "4.3.26", "x": -cw / 2, "y": 0, "width": cw, "height": chh, "fps": 30, "images": "./images/"},
        "bones": [{"name": "root"}, {"name": "chest", "parent": "root"}, {"name": "glow", "parent": "root", "y": chh * 0.48}, {"name": "ring", "parent": "root", "y": chh * 0.48}],
        "slots": [
            {"name": "glow", "bone": "glow", "color": "ffd96a00", "attachment": "glow", "blend": "additive"},
            {"name": "chest", "bone": "chest", "attachment": "chest_closed"},
            {"name": "ring", "bone": "ring", "color": "fff2b000", "attachment": "ring", "blend": "additive"},
        ],
        "skins": [{"name": "default", "attachments": {
            "glow": {"glow": {"scaleX": 2.4, "scaleY": 2.4, "width": gw, "height": gh}},
            "chest": {n: {"y": chh / 2, "width": cw, "height": chh} for n in ("chest_closed", "chest_open") + READY},
            "ring": {"ring": {"width": rw, "height": rh}},
        }}],
        "animations": {},
    }
    A = skel["animations"]
    A["idle"] = {"bones": {"chest": {"scale": [k(0), k(1.0, x=1.012, y=1.012), k(2.0)]}}}
    A["unlock"] = {
        "slots": {"glow": {"rgba": [rgba(0, 0, "ffd96a"), rgba(0.2, 1, "ffd96a"), rgba(0.8, 0.85, "ffd96a")]},
                  "ring": {"rgba": [rgba(0, 1, "fff2b0"), rgba(0.6, 0, "fff2b0")]}},
        "bones": {
            "chest": {"rotate": [k(0), k(0.08, value=-6), k(0.18, value=6), k(0.28, value=-4), k(0.38, value=3), k(0.5, value=-1), k(0.6)],
                      "scale": [k(0), k(0.15, x=1.12, y=1.12), k(0.4, x=1, y=1)]},
            "ring": {"scale": [k(0, x=0.4, y=0.4), k(0.6, x=1.7, y=1.7)]},
            "glow": {"scale": [k(0, x=0.6, y=0.6), k(0.3, x=1.1, y=1.1), k(0.8)]},
        },
    }
    if READY:
        A["unlock"]["slots"]["chest"] = {"attachment": [k(0, name="chest_ready")]}
    A["unlocked"] = {
        "slots": {"glow": {"rgba": [rgba(0, 0.85, "ffd96a"), rgba(0.6, 0.55, "ffd96a"), rgba(1.2, 0.85, "ffd96a")]},
                  **({"chest": {"attachment": [k(0, name="chest_ready")]}} if READY else {})},
        "bones": {"chest": {"rotate": [k(0, value=-2.5), k(0.6, value=2.5), k(1.2, value=-2.5)]},
                  "glow": {"scale": [k(0), k(0.6, x=1.12, y=1.12), k(1.2)]}},
    }
    A["open"] = {
        "slots": {"chest": {"attachment": [k(0, name="chest_open")]},
                  "glow": {"rgba": [rgba(0, 1, "fff0a0"), rgba(0.7, 0.9, "ffd96a")]},
                  "ring": {"rgba": [rgba(0, 1, "fffbe0"), rgba(0.55, 0, "fffbe0")]}},
        "bones": {"chest": {"scale": [k(0, x=0.75, y=0.75), k(0.18, x=1.18, y=1.18), k(0.45, x=1, y=1)]},
                  "ring": {"scale": [k(0, x=0.5, y=0.5), k(0.55, x=2.1, y=2.1)]},
                  "glow": {"scale": [k(0, x=1.5, y=1.5), k(0.7, x=1.15, y=1.15)]}},
    }
    A["opened"] = {
        "slots": {"chest": {"attachment": [k(0, name="chest_open")]},
                  "glow": {"rgba": [rgba(0, 0.9, "ffd96a"), rgba(0.8, 0.6, "ffd96a"), rgba(1.6, 0.9, "ffd96a")]}},
        "bones": {"glow": {"scale": [k(0, x=1.15, y=1.15), k(0.8, x=1.25, y=1.25), k(1.6, x=1.15, y=1.15)]}},
    }
    A["locked"] = {"slots": {"chest": {"rgba": [rgba(0, 1, "e6e6e6")]}}}
    return skel

# ---------------------------------------------------------------- frame
def frame():
    fw, fh = size("frame", "frame")
    bw, bh = size("frame", "beam")
    skel = {
        "skeleton": {"hash": "paradise-bloom-frame-v6", "spine": "4.3.26", "x": -fw / 2, "y": -fh / 2, "width": fw, "height": fh, "fps": 30, "images": "./images/"},
        "bones": [{"name": "root"}, {"name": "frame", "parent": "root"}, {"name": "shine", "parent": "root", "rotation": -20, "x": -fw * 0.7, "scaleY": 4.5, "scaleX": 1.4}],
        "slots": [
            {"name": "frame", "bone": "frame", "attachment": "frame"},
            {"name": "flash", "bone": "frame", "color": "ffffff00", "attachment": "frame", "blend": "additive"},
            {"name": "shine", "bone": "shine", "color": "fff6c800", "attachment": "beam", "blend": "additive"},
        ],
        "skins": [{"name": "default", "attachments": {
            "frame": {"frame": {"width": fw, "height": fh}},
            "flash": {"frame": {"width": fw, "height": fh}},
            "shine": {"beam": {"width": bw, "height": bh}},
        }}],
        "animations": {
            "idle": {"slots": {"flash": {"rgba": [rgba(0, 0)]}}},
            "win": {
                "slots": {"flash": {"rgba": [rgba(0, 0, "fff2c0"), rgba(0.12, 0.55, "fff2c0"), rgba(0.45, 0, "fff2c0")]},
                          "shine": {"rgba": [rgba(0, 0, "fff6c8"), rgba(0.1, 0.9, "fff6c8"), rgba(0.5, 0, "fff6c8")]}},
                "bones": {"shine": {"translate": [k(0), k(0.5, x=fw * 1.4)]}},
            },
            "anticipation": {"slots": {"flash": {"rgba": [rgba(0, 0.1, "ffd060"), rgba(0.4, 0.45, "ffd060"), rgba(0.8, 0.1, "ffd060")]}}},
            "feature": {"slots": {"flash": {"rgba": [rgba(0, 0.05, "ffe0f0"), rgba(1.5, 0.2, "ffe0f0"), rgba(3, 0.05, "ffe0f0")]}}},
        },
    }
    return skel

for rig, build in (("chest", chest), ("frame", frame)):
    out = os.path.join(ROOT, rig, rig + ".json")
    json.dump(build(), open(out, "w"), indent=1)
    print("wrote", out)


# ---------------------------------------------------------------- screens (big/mega/epic/max win, bonus intro, total win, cloud transition)
def screens():
    R = "screens"
    def att(name, **extra):
        w, h = size(R, name)
        d = {"width": w, "height": h}
        d.update(extra)
        return d
    bones = [{"name": "root"}]
    slots, skin = [], {}
    def add(slot, image, bone=None, x=0, y=0, sx=1, sy=1, rot=0, blend=None, attachments=None, parent="root"):
        b = bone or slot
        if not any(bb["name"] == b for bb in bones):
            bb = {"name": b, "parent": parent}
            if x: bb["x"] = x
            if y: bb["y"] = y
            if sx != 1: bb["scaleX"] = sx
            if sy != 1: bb["scaleY"] = sy
            if rot: bb["rotation"] = rot
            bones.append(bb)
        s = {"name": slot, "bone": b, "color": "ffffff00", "attachment": image}
        if blend: s["blend"] = blend
        slots.append(s)
        skin[slot] = attachments or {image: att(image)}

    # BACK — centred on screen, design space 1920×1080 (Spine y up).
    bones.append({"name": "back", "parent": "root"})
    add("b_rays", "rays", x=0, y=40, sx=1.25, sy=1.25, blend="additive", parent="back")
    add("b_glow", "glow", sx=7, sy=7, blend="additive", parent="back")
    for i, (x, img) in enumerate(((-620, "cloud_big_2"), (0, "cloud_big_1"), (620, "cloud_big_3"))):
        add(f"b_cloud{i}", img, x=x, y=-150, sx=0.62, sy=0.62, parent="back")
    COINS = [(-760, 0.0), (-520, 0.55), (-300, 0.2), (-90, 0.8), (120, 0.35), (330, 0.95), (540, 0.15), (760, 0.6), (-420, 1.1), (420, 1.25)]
    for i, (x, _) in enumerate(COINS):
        add(f"b_coin{i}", "coin", x=x, y=700, sx=0.55, sy=0.55, parent="back",
            attachments={"coin": att("coin"), "coin_edge": att("coin_edge")})
    GEMS = [(-640, 0.4, "gem_red"), (-200, 1.0, "gem_blue"), (260, 0.7, "gem_green"), (650, 0.05, "gem_red"), (-60, 1.35, "gem_green"), (500, 1.5, "gem_blue")]
    for i, (x, _, img) in enumerate(GEMS):
        add(f"b_gem{i}", img, x=x, y=700, sx=0.8, sy=0.8, parent="back")
    SPARKS = [(-700, 300), (-380, -260), (-160, 360), (210, -320), (420, 280), (720, -180), (-560, 60), (600, 120)]
    for i, (x, y) in enumerate(SPARKS):
        add(f"b_spark{i}", "spark", x=x, y=y, blend="additive", parent="back")
    add("b_ring", "ring", sx=0.5, sy=0.5, blend="additive", parent="back")

    # TITLE — design = title image; the game picks the attachment (title_big_win, …).
    titles = [n for n in ("title_big_win", "title_mega_win", "title_epic_win", "title_max_win", "title_total_win", "title_bloom_bonus", "title_bloom_super", "title_bloom_epic", "title_free_spins")]
    add("t_title", "title_big_win", attachments={n: att(n) for n in titles})
    # HERO paradise tree (epic / max) — design 900×800.
    add("h_glow", "glow", sx=5.5, sy=5.5, blend="additive")
    add("h_tree", "win_tree_v3")
    add("h_ring", "ring", sx=0.5, sy=0.5, blend="additive")
    # LOTUS (total win) — design 900×700.
    add("c_lotus", "win_lotus_v3")
    # BANNER (bonus intro) — design 1200×420: plaque, five lotuses, ribbon.
    add("n_plaque", "banner_plaque")
    for i in range(5):
        add(f"n_lotus{i}", "lotus_open_v3", x=(i - 2) * 205, y=6, sx=0.52, sy=0.52)
    add("n_ribbon", "ribbon_5x_minimum", y=-205)
    # CLOUDS (transition) — design 1920×1080.
    CL = [(-1300, 260, "cloud_big_1", 2.1), (1300, -160, "cloud_big_2", 2.2), (-1200, -380, "cloud_big_3", 2.0), (1250, 420, "cloud_big_3", 2.0), (0, -1100, "cloud_big_1", 2.4), (0, 1150, "cloud_big_2", 2.3)]
    for i, (x, y, img, s) in enumerate(CL):
        add(f"k_cloud{i}", img, x=x, y=y, sx=s, sy=s)

    A = {}
    def alpha(slot, keys, rgb="ffffff"):
        return {slot: {"rgba": [rgba(t, a, rgb) for t, a in keys]}}

    def back(name, rays_a, rays_rgb, glow_a, clouds, coins, gems, length):
        sl, bn = {}, {}
        sl.update(alpha("b_rays", [(0, rays_a), (length / 2, rays_a * 0.8), (length, rays_a)], rays_rgb))
        bn["b_rays"] = {"rotate": [k(0), k(length, value=-24)]}
        sl.update(alpha("b_glow", [(0, glow_a), (length / 2, glow_a * 0.75), (length, glow_a)], "ffe9a0"))
        for i in range(3):
            sl.update(alpha(f"b_cloud{i}", [(0, 1 if clouds else 0)]))
            if clouds:
                bn[f"b_cloud{i}"] = {"translate": [k(0), k(length / 2, y=14 if i % 2 else -14), k(length)]}
        for i, (x, phase) in enumerate(COINS):
            on = i < coins
            sl[f"b_coin{i}"] = {"rgba": [rgba(0, 1 if on else 0)]}
            if on:
                t0 = phase * length / 1.6
                # Wrap at the offscreen ends rather than tweening back upwards through the screen.
                first_y = -1400 * ((-t0 / length) % 1)
                ys = [k(0, y=first_y)]
                if t0 > 0:
                    ys.extend([k(max(0.02, t0 - 0.02), y=-1400, curve="stepped"), k(t0, y=0)])
                    ys.append(k(length, y=first_y))
                else:
                    ys.extend([k(length - 0.02, y=-1400, curve="stepped"), k(length, y=0)])
                # Two rendered views reveal the solid reeded edge; phase differs per coin.
                frames, scales, rotations = [], [], []
                distance = 0.78 + (i % 4) * 0.12
                for step in range(49):
                    t = length * step / 48
                    turn = (step + i * 3) % 12
                    edge = turn in (2, 3, 4, 8, 9, 10)
                    frames.append({"time": round(t, 4), "name": "coin_edge" if edge else "coin"})
                    # Both sprites retain their own thickness, with only a gentle turn squeeze.
                    scales.append(k(t, x=distance * (0.78 if edge else 1), y=distance))
                    rotations.append(k(t, value=(-18 if i % 2 else 18) + step * (7.5 if i % 2 else -7.5)))
                sl[f"b_coin{i}"]["attachment"] = frames
                bn[f"b_coin{i}"] = {"translate": ys, "rotate": rotations, "scale": scales}
        for i, (x, phase, _) in enumerate(GEMS):
            on = i < gems
            sl[f"b_gem{i}"] = {"rgba": [rgba(0, 1 if on else 0)]}
            if on:
                t0 = phase * length / 1.6
                # Descend continuously; the stepped reset stays below/above the viewport.
                first_y = -1400 * ((-t0 / length) % 1)
                ys = [k(0, y=first_y)]
                if t0 > 0:
                    ys.extend([k(max(0.02, t0 - 0.02), y=-1400, curve="stepped"), k(t0, y=0)])
                    ys.append(k(length, y=first_y))
                else:
                    ys.extend([k(length - 0.02, y=-1400, curve="stepped"), k(length, y=0)])
                bn[f"b_gem{i}"] = {"translate": ys,
                                   "rotate": [k(0), k(length, value=-180 if i % 2 else 180)]}
        for i in range(len(SPARKS)):
            ph = (i * 0.37) % 1 * length
            sl.update(alpha(f"b_spark{i}", [(0, 0), (min(length, ph), 0), (min(length, ph + 0.25), 1), (min(length, ph + 0.6), 0), (length, 0)], "fff6c8"))
            bn[f"b_spark{i}"] = {"scale": [k(0, x=0.3, y=0.3), k(min(length, ph + 0.25), x=1.1, y=1.1), k(min(length, ph + 0.6), x=0.3, y=0.3)]}
        sl.update(alpha("b_ring", [(0, 0)]))
        A[name] = {"slots": sl, "bones": bn}

    back("back_big", 0.35, "ffe08a", 0.55, True, 0, 0, 3.2)
    back("back_mega", 0.5, "e3a8ff", 0.6, True, 8, 0, 2.4)
    back("back_epic", 0.6, "ffab7a", 0.7, False, 10, 6, 2.4)
    back("back_max", 0.55, "ffe070", 0.7, False, 10, 6, 2.0)
    back("back_intro", 0.4, "ffd6f0", 0.45, False, 0, 0, 3.2)
    back("back_total", 0.32, "ffe08a", 0, False, 6, 3, 2.4)
    A["back_burst"] = {"slots": alpha("b_ring", [(0, 1), (0.7, 0)], "fff2b0"),
                       "bones": {"b_ring": {"scale": [k(0, x=0.6, y=0.6), k(0.7, x=7, y=7)]}}}

    A["title_in"] = {"slots": alpha("t_title", [(0, 0), (0.12, 1)]),
                     "bones": {"t_title": {"scale": [k(0, x=0.25, y=0.25), k(0.22, x=1.14, y=1.14), k(0.42, x=1, y=1)]}}}
    A["title_loop"] = {"slots": alpha("t_title", [(0, 1)]),
                       "bones": {"t_title": {"scale": [k(0), k(1.0, x=1.04, y=1.04), k(2.0)], "rotate": [k(0, value=-1), k(1.0, value=1), k(2.0, value=-1)]}}}

    A["hero_in"] = {"slots": {**alpha("h_tree", [(0, 0), (0.1, 1)]), **alpha("h_glow", [(0, 0), (0.3, 0.9)], "ffd96a"), **alpha("h_ring", [(0, 1), (0.6, 0)], "fff2b0")},
                    "bones": {"h_tree": {"scale": [k(0, x=0.2, y=0.2), k(0.3, x=1.12, y=1.12), k(0.55, x=1, y=1)]},
                              "h_ring": {"scale": [k(0, x=0.6, y=0.6), k(0.6, x=5, y=5)]}}}
    A["hero_loop"] = {"slots": {**alpha("h_tree", [(0, 1)]), **alpha("h_glow", [(0, 0.9), (1.0, 0.6), (2.0, 0.9)], "ffd96a")},
                      "bones": {"h_tree": {"translate": [k(0), k(1.0, y=14), k(2.0)]}, "h_glow": {"scale": [k(0), k(1.0, x=1.1, y=1.1), k(2.0)]}}}

    A["crest_in"] = {"slots": {**alpha("c_lotus", [(0, 0), (0.1, 1)])},
                     "bones": {"c_lotus": {"scale": [k(0, x=0.3, y=0.3), k(0.3, x=1.1, y=1.1), k(0.5, x=1, y=1)]}}}
    A["crest_loop"] = {"slots": {**alpha("c_lotus", [(0, 1)])},
                       "bones": {"c_lotus": {"translate": [k(0), k(1.2, y=10), k(2.4)]}}}

    bin_slots = {**alpha("n_plaque", [(0, 0), (0.15, 1)])}
    bin_bones = {"n_plaque": {"scale": [k(0, x=0.1, y=1), k(0.3, x=1.04, y=1), k(0.42, x=1, y=1)]}}
    loop_slots = {**alpha("n_plaque", [(0, 1)])}
    loop_bones = {}
    for i in range(5):
        t0 = 0.3 + i * 0.09
        bin_slots.update(alpha(f"n_lotus{i}", [(0, 0), (t0, 0), (t0 + 0.05, 1)]))
        bin_bones[f"n_lotus{i}"] = {"scale": [k(0, x=0, y=0), k(t0, x=0, y=0), k(t0 + 0.2, x=1.18, y=1.18), k(t0 + 0.38, x=1, y=1)]}
        loop_slots.update(alpha(f"n_lotus{i}", [(0, 1)]))
        ph = i * 0.24
        loop_bones[f"n_lotus{i}"] = {"translate": [k(0, y=0), k(ph + 0.01, y=0), k(ph + 0.6, y=12), k(ph + 1.2, y=0), k(2.4, y=0)]}
    A["banner_in"] = {"slots": bin_slots, "bones": bin_bones}
    A["banner_loop"] = {"slots": loop_slots, "bones": loop_bones}
    A["ribbon_in"] = {"slots": alpha("n_ribbon", [(0, 0), (0.75, 0), (0.85, 1)]),
                      "bones": {"n_ribbon": {"scale": [k(0, x=0, y=0), k(0.75, x=0, y=0), k(0.95, x=1.15, y=1.15), k(1.1, x=1, y=1)]}}}

    sl, bn = {}, {}
    for i, (x, y, _, s) in enumerate(CL):
        sl.update(alpha(f"k_cloud{i}", [(0, 0), (0.15, 1), (1.1, 1), (1.3, 0)]))
        bn[f"k_cloud{i}"] = {"translate": [k(0), k(0.6, x=-x * 0.85, y=-y * 0.85), k(0.7, x=-x * 0.88, y=-y * 0.88), k(1.3, x=-x * 1.9, y=-y * 1.9)]}
    A["clouds_sweep"] = {"slots": sl, "bones": bn}

    return {
        "skeleton": {"hash": "paradise-bloom-screens-v10-continuous-fall", "spine": "4.3.26", "x": -960, "y": -540, "width": 1920, "height": 1080, "fps": 30, "images": "./images/"},
        "bones": bones, "slots": slots, "skins": [{"name": "default", "attachments": skin}], "animations": A,
    }

json.dump(screens(), open(os.path.join(ROOT, "screens", "screens.json"), "w"), indent=1)
print("wrote screens")
