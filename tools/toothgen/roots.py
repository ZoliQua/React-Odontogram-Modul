"""Transform root topology consistently across registered SVG layers.

The module can redraw a two-root premolar as one continuous tapered root or
weave a third palatal root into upper-molar contours and lumen layers.
"""

from __future__ import annotations

import re

import svgpath


def _polylines(d: str):
    cmds = svgpath.to_absolute(d)
    subs, pts = [], []
    cur = start = (0.0, 0.0)
    for c, a in cmds:
        if c == "M":
            if len(pts) > 1:
                subs.append(pts)
            cur = (a[0], a[1])
            start = cur
            pts = [cur]
        elif c == "Z":
            if len(pts) > 1:
                pts.append(start)
                subs.append(pts)
            pts = [start]
            cur = start
        else:
            if c == "C":
                p0 = cur
                c1 = (a[0], a[1])
                c2 = (a[2], a[3])
                p3 = (a[4], a[5])
                for k in range(1, 9):
                    t = k / 8
                    mt = 1 - t
                    pts.append(
                        (
                            mt**3 * p0[0]
                            + 3 * mt * mt * t * c1[0]
                            + 3 * mt * t * t * c2[0]
                            + t**3 * p3[0],
                            mt**3 * p0[1]
                            + 3 * mt * mt * t * c1[1]
                            + 3 * mt * t * t * c2[1]
                            + t**3 * p3[1],
                        )
                    )
                cur = p3
            else:
                cur = (a[-2], a[-1])
                pts.append(cur)
    if len(pts) > 1:
        subs.append(pts)
    return subs


def spans_at(subs, y: float):
    xs = []
    for s in subs:
        for (ax, ay), (bx, by) in zip(s, s[1:]):
            if (ay <= y < by) or (by <= y < ay):
                t = (y - ay) / (by - ay)
                xs.append(ax + t * (bx - ax))
    xs.sort()
    return [(xs[i], xs[i + 1]) for i in range(0, len(xs) - 1, 2)]


def find_furcation(base_d: str, apex: float, cej: float, steps: int = 200):

    subs = _polylines(base_d)
    furc = apex
    for i in range(steps + 1):
        y = apex + (cej - apex) * i / steps
        if len(spans_at(subs, y)) >= 2:
            furc = y
    return furc


CANINE_ROOT_PROFILE = [
    1.000,
    0.940,
    0.896,
    0.860,
    0.827,
    0.802,
    0.778,
    0.751,
    0.727,
    0.704,
    0.681,
    0.658,
    0.633,
    0.606,
    0.576,
    0.540,
    0.499,
    0.438,
    0.350,
    0.230,
    0.060,
]


def _profile_at(s: float) -> float:

    s = min(1.0, max(0.0, s))
    x = s * (len(CANINE_ROOT_PROFILE) - 1)
    i = int(x)
    if i >= len(CANINE_ROOT_PROFILE) - 1:
        return CANINE_ROOT_PROFILE[-1]
    f = x - i
    return CANINE_ROOT_PROFILE[i] * (1 - f) + CANINE_ROOT_PROFILE[i + 1] * f


def _catmull_cubics(pts):

    out = []
    n = len(pts)
    for i in range(n - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < n else pts[i + 1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        out.append(("C", [c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]]))
    return out


def merge_roots_xmap(base_d: str, apex: float, cej: float, samples: int = 80):

    subs = _polylines(base_d)
    furc = find_furcation(base_d, apex, cej)

    ys, r1s, l2s = [], [], []
    for i in range(samples + 1):
        y = apex + (furc - apex) * i / samples
        sp = spans_at(subs, y)
        if len(sp) >= 2:
            r1 = sp[0][1]
            l2 = sp[-1][0]
        else:
            r1 = l2 = (sp[0][0] + sp[0][1]) / 2 if sp else None
        if r1 is None:
            continue
        ys.append(y)
        r1s.append(r1)
        l2s.append(l2)

    if not ys:
        raise ValueError("two roots were not found")

    def lookup(y: float):
        if y >= ys[-1]:
            return r1s[-1], l2s[-1]
        if y <= ys[0]:
            return r1s[0], l2s[0]
        lo, hi = 0, len(ys) - 1
        while hi - lo > 1:
            mid = (lo + hi) // 2
            if ys[mid] <= y:
                lo = mid
            else:
                hi = mid
        t = (y - ys[lo]) / (ys[hi] - ys[lo])
        return (r1s[lo] + (r1s[hi] - r1s[lo]) * t, l2s[lo] + (l2s[hi] - l2s[lo]) * t)

    def fn(x: float, y: float):
        if y >= furc:
            return (x, y)
        r1, l2 = lookup(y)
        if l2 - r1 <= 1e-9:
            return (x, y)
        cx = (r1 + l2) / 2.0
        if x <= r1:
            return (x + (cx - r1), y)
        if x >= l2:
            return (x - (l2 - cx), y)
        return (cx, y)

    return fn, furc


def _contour_of(d: str):

    cmds = svgpath.to_absolute(d)
    segs, rest = [], []
    cur = start = None
    closed = False
    for idx, (cmd, a) in enumerate(cmds):
        if closed:
            rest.append((cmd, a))
            continue
        if cmd == "M":
            if cur is not None:
                closed = True
                rest.append((cmd, a))
                continue
            cur = start = (a[0], a[1])
        elif cmd == "Z":
            if cur != start:
                segs.append((cur, cur, start, start))
            cur = start
            closed = True
        elif cmd == "L":
            p3 = (a[0], a[1])
            segs.append((cur, cur, p3, p3))
            cur = p3
        else:
            p3 = (a[4], a[5])
            segs.append((cur, (a[0], a[1]), (a[2], a[3]), p3))
            cur = p3
    if not closed and cur is not None and cur != start:
        segs.append((cur, cur, start, start))
    return segs, rest


def _crossings_of(segs, y: float, steps: int = 24):

    out = []
    for i, seg in enumerate(segs):
        prev_t, prev_y = 0.0, svgpath._bez(*seg, 0.0)[1]
        for k in range(1, steps + 1):
            t = k / steps
            yy = svgpath._bez(*seg, t)[1]
            if (prev_y - y) * (yy - y) < 0:
                lo, hi = prev_t, t
                for _ in range(40):
                    m = (lo + hi) / 2
                    if (svgpath._bez(*seg, lo)[1] - y) * (
                        svgpath._bez(*seg, m)[1] - y
                    ) <= 0:
                        hi = m
                    else:
                        lo = m
                tt = (lo + hi) / 2
                out.append((i, tt, svgpath._bez(*seg, tt)))
            prev_t, prev_y = t, yy
    return out


def _walk(segs, c1, c2, n: int = 16):

    pts = []
    i = c1[0]
    guard = 0
    while guard <= len(segs) + 1:
        guard += 1
        lo = c1[1] if (i == c1[0] and not pts) else 0.0
        hi = c2[1] if i == c2[0] and (pts or c2[1] > c1[1]) else 1.0
        if hi > lo:
            for k in range(n + 1):
                pts.append(svgpath._bez(*segs[i], lo + (hi - lo) * k / n))
        if i == c2[0] and (pts or c2[1] > 0):
            break
        i = (i + 1) % len(segs)
    return pts


def _splice(segs, c_start, c_end, new_cubics, rest):

    pa = c_start[2]
    out = [("M", [pa[0], pa[1]])] + list(new_cubics)

    i = c_end[0]
    first = True
    guard = 0
    while guard <= len(segs) + 1:
        guard += 1
        lo = c_end[1] if first else 0.0
        hi = 1.0
        stop = False
        if i == c_start[0] and (not first or c_start[1] > c_end[1]):
            hi = c_start[1]
            stop = True
        if hi > lo:
            seg = segs[i]
            part = seg
            if lo > 0:
                _, part = svgpath._split_cubic(*part, lo)
            if hi < 1:
                tt = (hi - lo) / (1 - lo) if lo > 0 else hi
                part, _ = svgpath._split_cubic(*part, tt)
            out.append(
                (
                    "C",
                    [
                        part[1][0],
                        part[1][1],
                        part[2][0],
                        part[2][1],
                        part[3][0],
                        part[3][1],
                    ],
                )
            )
        if stop:
            break
        first = False
        i = (i + 1) % len(segs)
    out.append(("Z", []))
    out += rest
    return svgpath.serialize(out, 2)


def weave_palatal_root(
    d: str,
    cx: float,
    furc: float,
    y_apex: float,
    half_top: float = 2.6,
    inset: float = 3.2,
):

    segs, rest = _contour_of(d)
    if len(segs) < 4:
        return None
    y_split = furc - inset
    xs = _crossings_of(segs, y_split)
    if len(xs) < 4:
        return None

    valley = None
    for c1, c2 in list(zip(xs, xs[1:])) + [(xs[-1], xs[0])]:
        pts = _walk(segs, c1, c2)
        if not pts:
            continue
        ymax = max(p[1] for p in pts)
        if ymax <= y_split + 0.3:
            continue
        if ymax > furc + 1.5:
            continue
        lo_x, hi_x = min(p[0] for p in pts), max(p[0] for p in pts)
        if abs((lo_x + hi_x) / 2 - cx) > 3.0:
            continue
        if valley is None or ymax > valley[2]:
            valley = (c1, c2, ymax)
    if valley is None:
        return None
    c_start, c_end = valley[0], valley[1]

    pa, pb = c_start[2], c_end[2]
    la, ra = cx - half_top, cx + half_top
    mid_y = (y_apex + y_split) / 2.0
    knee = mid_y + (y_split - mid_y) * 0.35
    excursion = [
        ("C", [pa[0], knee, la, mid_y, la, y_apex + half_top * 1.7]),
        (
            "C",
            [
                la,
                y_apex - half_top * 0.45,
                ra,
                y_apex - half_top * 0.45,
                ra,
                y_apex + half_top * 1.7,
            ],
        ),
        ("C", [ra, mid_y, pb[0], knee, pb[0], pb[1]]),
    ]
    return _splice(segs, c_start, c_end, excursion, rest)


def single_root_contour(
    d: str,
    cx: float,
    cej: float,
    y_apex: float,
    cut_above: float = 1.0,
    samples: int = 22,
    max_half: float | None = None,
):

    segs, rest = _contour_of(d)
    if len(segs) < 4:
        return None

    y_cut = cej - cut_above
    xs = _crossings_of(segs, y_cut)
    if len(xs) != 2:
        return None

    cand = None
    for c1, c2 in [(xs[0], xs[1]), (xs[1], xs[0])]:
        pts = _walk(segs, c1, c2)
        if not pts:
            continue
        if (
            min(p[1] for p in pts) < y_cut - 2.0
            and max(p[1] for p in pts) <= y_cut + 0.6
        ):
            cand = (c1, c2)
            break
    if cand is None:
        return None
    c_start, c_end = cand

    pa, pb = c_start[2], c_end[2]
    half = abs(pb[0] - pa[0]) / 2.0
    mid_x = (pa[0] + pb[0]) / 2.0
    # The width at the cut is the right measure for an outer contour and the
    # wrong one for a lumen: a pulp layer's cut necessarily lies where the two
    # canals still meet, that is in the CHAMBER, so taking the width there draws
    # a canal as wide as the root meant to contain it. `max_half` is the caller's
    # measurement of what actually fits.
    if max_half is not None:
        half = min(half, max_half)
    if half < 0.4:
        return None
    span = y_cut - y_apex
    if span < 3.0:
        return None

    left_first = pa[0] < pb[0]
    pts = []
    for k in range(samples + 1):
        s = k / samples
        y = y_cut - span * s
        w = half * _profile_at(s)
        pts.append((mid_x - w, y) if left_first else (mid_x + w, y))

    tip_w = half * _profile_at(1.0)
    pts.append((mid_x, y_apex - tip_w * 0.9))
    for k in range(samples, -1, -1):
        s = k / samples
        y = y_cut - span * s
        w = half * _profile_at(s)
        pts.append((mid_x + w, y) if left_first else (mid_x - w, y))
    pts[0] = pa
    pts[-1] = pb

    return _splice(segs, c_start, c_end, _catmull_cubics(pts), rest)


def single_root_layers(
    txt: str,
    cx: float,
    cej: float,
    apex: float,
    lumen: bool = False,
    max_half: float | None = None,
):
    """Redraw two roots as one across the registered layers.

    Runs in two passes, contours first and lumen second, because the canal can
    only be sized once the root that has to contain it exists: the caller
    measures the redrawn root and passes `max_half` back in.
    """

    changed: list[str] = []
    stack: list[str] = []

    def allowed(el_id: str) -> bool:
        names = [n for n in [el_id] + stack if n]

        if any(n.startswith("milktooth") for n in names):
            return False
        if is_lumen(names) != lumen:
            return False
        return any(n.startswith(p) for n in names for p in PALATAL_ROOT_LAYERS)

    def repl(m):
        head, attrs = m.group(1), m.group(2)
        if head == "g":
            if not attrs.rstrip().endswith("/"):
                idm = re.search(r'\sid="([^"]+)"', attrs)
                stack.append(idm.group(1) if idm else "")
            return m.group(0)
        if head == "/g":
            if stack:
                stack.pop()
            return m.group(0)

        dm = re.search(r'\sd="([^"]+)"', attrs)
        if not dm:
            return m.group(0)
        idm = re.search(r'\sid="([^"]+)"', attrs)
        el_id = idm.group(1) if idm else ""
        if not allowed(el_id):
            return m.group(0)

        d = dm.group(1)
        subs = _polylines(d)
        pts = [p for s in subs for p in s]
        if not pts:
            return m.group(0)
        y0 = min(p[1] for p in pts)
        # A lumen reaches less far apically than the contour around it, so the
        # depth that identifies a two-rooted contour would reject the very canal
        # pair that has to be merged with it.
        if y0 > cej - (1.0 if lumen else 3.0):
            return m.group(0)

        if not any(
            len(spans_at(subs, y0 + (cej - y0) * f)) >= 2
            for f in (0.2, 0.35, 0.5, 0.65)
        ):
            return m.group(0)

        y_top = max(y0 + 1.0, apex)
        for k in range(40):
            y_cut = (cej - 0.2 if lumen else cej - 1.0) - k * 0.5
            if y_cut <= y_top + 2.0:
                break
            out = single_root_contour(d, cx, y_cut + 1.0, y_top, max_half=max_half)
            if out is not None:
                changed.append(el_id or f"(in {stack[-1] if stack else '?'})")
                attrs2 = attrs.replace(dm.group(0), f' d="{out}"', 1)
                return f"<{head}{attrs2}>"
        return m.group(0)

    out = re.sub(r"<(path|polygon|g|/g)([^>]*?)>", repl, txt)
    return out, changed


def _taper_subpath(
    cx: float, half_top: float, half_bottom: float, y_apex: float, y_base: float
) -> str:

    lb, rb = cx - half_bottom, cx + half_bottom
    la, ra = cx - half_top, cx + half_top
    mid = (y_apex + y_base) / 2.0
    return (
        f"M{lb:.2f},{y_base:.2f}"
        f"C{lb:.2f},{mid:.2f} {la:.2f},{mid - (mid - y_apex) * 0.45:.2f} {la:.2f},{y_apex + half_top * 1.6:.2f}"
        f"C{la:.2f},{y_apex - half_top * 0.5:.2f} {ra:.2f},{y_apex - half_top * 0.5:.2f} {ra:.2f},{y_apex + half_top * 1.6:.2f}"
        f"C{ra:.2f},{mid - (mid - y_apex) * 0.45:.2f} {rb:.2f},{mid:.2f} {rb:.2f},{y_base:.2f}Z"
    )


PALATAL_ROOT_LAYERS = (
    "tooth-base",
    "tooth-radix",
    "tooth-under-gum",
    "tooth-crownprep",
    "tooth-broken-",
    "tooth-healthy-pulp",
    "tooth-inflam-pulp",
    "milktooth-base",
    "milktooth-healthy-pulp",
    "milktooth-inflam-pulp",
    "bone-base",
    "gum-base",
    "parodontal",
    "endo-",
    "caries-root",
)


PULP_LAYERS = (
    "tooth-healthy-pulp",
    "tooth-inflam-pulp",
    "milktooth-healthy-pulp",
    "milktooth-inflam-pulp",
    "pulp-inflam-path",
)


def _layer_paths(txt: str, prefixes, handler):
    """Rewrite the `d` of every path whose own id or an enclosing group's id
    starts with one of `prefixes`. `handler(d)` returns a replacement or None."""

    stack: list[str] = []
    changed: list[str] = []

    def allowed(el_id: str) -> bool:
        names = [el_id] + stack
        return any(n.startswith(p) for n in names if n for p in prefixes)

    def repl(m):
        head, attrs = m.group(1), m.group(2)
        if head == "g":
            if not attrs.rstrip().endswith("/"):
                idm = re.search(r'\sid="([^"]+)"', attrs)
                stack.append(idm.group(1) if idm else "")
            return m.group(0)
        if head == "/g":
            if stack:
                stack.pop()
            return m.group(0)

        dm = re.search(r'\sd="([^"]+)"', attrs)
        if not dm:
            return m.group(0)
        idm = re.search(r'\sid="([^"]+)"', attrs)
        el_id = idm.group(1) if idm else ""
        if not allowed(el_id):
            return m.group(0)

        new_d = handler(dm.group(1))
        if new_d is None:
            return m.group(0)
        changed.append(el_id or f"(in {stack[-1] if stack else '?'})")
        attrs2 = attrs.replace(dm.group(0), f' d="{new_d}"', 1)
        return f"<{head}{attrs2}>"

    out = re.sub(r"<(path|polygon|g|/g)([^>]*?)>", repl, txt)
    return out, changed


def scale_pulp(
    txt: str,
    factor: float,
    cx: float,
    apex: float | None = None,
    margin: float = 1.2,
):
    """Enlarge the pulp of a primary tooth.

    The primary pulp is relatively larger than the permanent one, but the horns
    sit where they sit: they are the clinically relevant landmark, and moving
    them would change where a preparation is read as an exposure. The whole pulp
    is therefore anchored on the horn tips - the occlusal-most point across all
    pulp layers, taken once for the file so chamber and canals keep their
    relation to each other - and grows apically and in width from there.

    The apical growth is capped so the enlarged pulp still ends `margin` inside
    the root apex. Without the cap the very enlargement that makes a tooth read
    as primary is what pushes its canal out through the root tip.
    """

    pts = []

    def collect(d: str):
        pts.extend(p for sub in _polylines(d) for p in sub)
        return None

    _layer_paths(txt, PULP_LAYERS, collect)
    if not pts:
        return txt, [], 1.0

    horn = max(p[1] for p in pts)
    top = min(p[1] for p in pts)

    fy = factor
    if apex is not None and horn > top:
        room = horn - (apex + margin)
        if room > 0:
            fy = min(fy, room / (horn - top))
        else:
            fy = 1.0
    fy = max(1.0, fy)

    def grow(d: str):
        return svgpath.warp_path_d(
            d, lambda x, y: (cx + (x - cx) * factor, horn - (horn - y) * fy)
        )

    out, changed = _layer_paths(txt, PULP_LAYERS, grow)
    return out, changed, fy


def spread_roots_xmap(
    cx: float,
    apex: float,
    cej: float,
    factor: float,
    hook: float = 0.35,
    knee: float = 0.7,
):
    """Splay the roots of a primary tooth, then hook the tips back in.

    Primary roots diverge to make room for the permanent germ developing between
    them, and curve back towards their apices. The divergence is widest around
    `knee` of the root length and is reduced again by `hook` at the tip, which
    is what makes the roots read as bulbous rather than merely as wider.

    Returned as an x-map so it composes with the y-warp in `build_one` and every
    layer travels through the same transformation - the roots cannot separate
    from the bone, gum and lumen layers drawn around them.
    """

    span = cej - apex
    if span <= 0:
        raise ValueError("the cervical line must sit occlusal to the apex")
    tip = factor - hook * (factor - 1.0)

    def amplitude(y: float) -> float:
        if y >= cej:
            return 1.0
        s = min(1.0, (cej - y) / span)
        if s <= knee:
            t = s / knee
        else:
            t = (s - knee) / (1.0 - knee)
        ease = t * t * (3.0 - 2.0 * t)
        if s <= knee:
            return 1.0 + (factor - 1.0) * ease
        return factor + (tip - factor) * ease

    def fn(x: float, y: float):
        return (cx + (x - cx) * amplitude(y), y)

    return fn


def converge_roots_layers(
    txt: str,
    cx: float,
    apex: float,
    cej: float,
    factor: float,
    knee: float = 0.55,
):
    """Pull the roots together on the TOOTH layers only.

    `spread_roots_xmap` is returned to `build_one` as a whole-template x-map, so
    it reaches gum and bone as well. That is right when roots splay around a
    developing germ - the socket moves with them - but wrong here: converging
    the roots of an upper premolar to show its buccal aspect must not pinch the
    gum band, which visibly narrowed the whole tile when it did.

    So the same map is applied through the registered tooth and canal layers
    instead, and everything around the tooth stays where it was.
    """

    fn = spread_roots_xmap(cx, apex, cej, factor, hook=0.0, knee=knee)
    changed: list[str] = []
    stack: list[str] = []

    def allowed(el_id: str) -> bool:
        names = [el_id] + stack
        return any(n.startswith(p) for n in names if n for p in PALATAL_ROOT_LAYERS)

    def repl(m):
        head, attrs = m.group(1), m.group(2)
        if head == "g":
            if attrs.rstrip().endswith("/"):
                return m.group(0)
            idm = re.search(r'\sid="([^"]+)"', attrs)
            stack.append(idm.group(1) if idm else "")
            return m.group(0)
        if head == "/g":
            if stack:
                stack.pop()
            return m.group(0)
        dm = re.search(r'\sd="([^"]+)"', attrs)
        if not dm:
            return m.group(0)
        idm = re.search(r'\sid="([^"]+)"', attrs)
        el_id = idm.group(1) if idm else ""
        if not allowed(el_id):
            return m.group(0)
        warped = svgpath.warp_path_d(dm.group(1), fn)
        changed.append(el_id or f"(in {stack[-1] if stack else '?'})")
        attrs2 = attrs.replace(dm.group(0), f' d="{warped}"', 1)
        return f"<{head}{attrs2}>"

    out = re.sub(r"<(path|polygon|g|/g)([^>]*?)>", repl, txt)
    return out, changed


def shorten_one_root_layers(
    txt: str,
    cx: float,
    apex: float,
    furc: float,
    amount: float,
    band: float = 1.6,
):
    """Pull ONE of the two root tips down, on the tooth layers only.

    The convergence alone leaves two tips at the same height, which reads as a
    tooth with a slit rather than as one root standing in front of another. A
    structure further from the viewer also ends higher up the picture; dropping
    the palatal tip is what turns the pair into depth.

    Applied to the half on the palatal side of `cx` and blended across a `band`
    either side of it, so the contour is eased rather than stepped where the two
    halves meet.
    """

    span = furc - apex
    if span <= 0:
        raise ValueError("the furcation must sit occlusal to the apex")

    def fn(x: float, y: float):
        if y >= furc:
            return (x, y)
        t = (x - cx) / band
        w = 0.0 if t <= -1.0 else (1.0 if t >= 1.0 else (t + 1.0) / 2.0)
        w = w * w * (3.0 - 2.0 * w)
        depth = min(1.0, (furc - y) / span)
        return (x, y + (furc - y) * amount * w * depth)

    changed: list[str] = []
    stack: list[str] = []

    def allowed(el_id: str) -> bool:
        names = [el_id] + stack
        return any(n.startswith(p) for n in names if n for p in PALATAL_ROOT_LAYERS)

    def repl(m):
        head, attrs = m.group(1), m.group(2)
        if head == "g":
            if attrs.rstrip().endswith("/"):
                return m.group(0)
            idm = re.search(r'\sid="([^"]+)"', attrs)
            stack.append(idm.group(1) if idm else "")
            return m.group(0)
        if head == "/g":
            if stack:
                stack.pop()
            return m.group(0)
        dm = re.search(r'\sd="([^"]+)"', attrs)
        if not dm:
            return m.group(0)
        idm = re.search(r'\sid="([^"]+)"', attrs)
        el_id = idm.group(1) if idm else ""
        if not allowed(el_id):
            return m.group(0)
        changed.append(el_id or f"(in {stack[-1] if stack else '?'})")
        attrs2 = attrs.replace(dm.group(0), f' d="{svgpath.warp_path_d(dm.group(1), fn)}"', 1)
        return f"<{head}{attrs2}>"

    out = re.sub(r"<(path|polygon|g|/g)([^>]*?)>", repl, txt)
    return out, changed


def palatal_root_subpaths(
    txt: str,
    cx: float,
    apex: float,
    cej: float,
    furc: float,
    half_top: float = 2.6,
    half_bottom: float = 5.0,
):

    changed: list[str] = []

    stack: list[str] = []

    def allowed(el_id: str) -> bool:
        names = [el_id] + stack
        return any(n.startswith(p) for n in names if n for p in PALATAL_ROOT_LAYERS)

    def repl(m):
        head, attrs = m.group(1), m.group(2)
        if head == "g":
            if attrs.rstrip().endswith("/"):
                return m.group(0)
            idm = re.search(r'\sid="([^"]+)"', attrs)
            stack.append(idm.group(1) if idm else "")
            return m.group(0)
        if head == "/g":
            if stack:
                stack.pop()
            return m.group(0)

        dm = re.search(r'\sd="([^"]+)"', attrs)
        if not dm:
            return m.group(0)
        idm = re.search(r'\sid="([^"]+)"', attrs)
        el_id = idm.group(1) if idm else ""
        if not allowed(el_id):
            return m.group(0)

        d = dm.group(1)

        pts = [p for sub in _polylines(d) for p in sub]
        if not pts:
            return m.group(0)
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        y0, y1 = min(ys), max(ys)
        if y0 > furc - 0.5:
            return m.group(0)
        if not (min(xs) < cx < max(xs)):
            return m.group(0)

        top = max(y0 + 1.2, apex)
        base = min(furc, y1)
        if base - top < 3.0:
            return m.group(0)

        # A drawn palatal root and the canal inside it are not the same width.
        # Before this, every layer got the contour's half-widths and the canal
        # came out filling its own root.
        if is_lumen([el_id] + stack):
            scale = LUMEN_HALF_FRAC
        else:
            scale = 1.0 if (max(xs) - min(xs)) > (half_bottom * 3) else 0.42
        name = el_id or f"(in {stack[-1] if stack else '?'})"

        woven = weave_palatal_root(d, cx, furc, top, half_top * scale)
        if woven is not None:
            changed.append(name)
            attrs2 = attrs.replace(dm.group(0), f' d="{woven}"', 1)
            return f"<{head}{attrs2}>"

        subs = _polylines(d)

        sp = spans_at(subs, (top + base) / 2.0)
        left = [s for s in sp if s[1] <= cx]
        right = [s for s in sp if s[0] >= cx]
        if not left or not right:
            return m.group(0)

        reach = 1.9 * half_bottom
        if (cx - left[-1][1]) > reach or (right[0][0] - cx) > reach:
            return m.group(0)

        changed.append(name + "*")
        extra = _taper_subpath(cx, half_top * scale, half_bottom * scale, top, base)
        attrs2 = attrs.replace(dm.group(0), f' d="{d}{extra}"', 1)
        return f"<{head}{attrs2}>"

    out = re.sub(r"<(path|polygon|g|/g)([^>]*?)>", repl, txt)
    return out, changed


# --------------------------------------------------------------------------
# Lumen contracts
# --------------------------------------------------------------------------
# Layers that draw a LUMEN - canal, chamber, root filling, post - as opposed to
# the outer contour. The root generators have to tell them apart: a redrawn root
# must not give a lumen layer the contour's dimensions, or the canal fills the
# whole root.
LUMEN_LAYERS = (
    "tooth-healthy-pulp",
    "tooth-inflam-pulp",
    "milktooth-healthy-pulp",
    "milktooth-inflam-pulp",
    "endo-",
)

# Two `endo-` layers are not lumen and must not be treated as such. An
# apicoectomy is drawn ACROSS the apex and a resorption defect ON the root
# surface, so both legitimately reach past the outline that contains a canal.
# Sweeping them in with the prefix would clamp a resection line into the root it
# is meant to cut off, and squeeze a surface lesion to a canal's width.
NOT_LUMEN_LAYERS = (
    "endo-resection",
    "endo-resorption",
)

# A canal's half-width as a fraction of the root's half-width at the same height.
LUMEN_HALF_FRAC = 0.30


def is_lumen(names) -> bool:
    kept = [n for n in names if n and not n.startswith(NOT_LUMEN_LAYERS)]
    return any(n.startswith(p) for n in kept for p in LUMEN_LAYERS)


def _lumen_paths(txt: str, handler):
    """Rewrite the `d` of every path belonging to a lumen layer.

    Same group-stack technique the root generators use: many paths carry no id
    of their own and inherit their meaning from the enclosing `<g>`. Only `d`
    attributes change - no element is added or removed, no id/class/style is
    touched, so the SVG parity fingerprint is unaffected.
    """
    stack: list[str] = []
    hit: list[str] = []

    def repl(m):
        head, attrs = m.group(1), m.group(2)
        if head == "g":
            if not attrs.rstrip().endswith("/"):
                idm = re.search(r'\sid="([^"]+)"', attrs)
                stack.append(idm.group(1) if idm else "")
            return m.group(0)
        if head == "/g":
            if stack:
                stack.pop()
            return m.group(0)
        dm = re.search(r'\sd="([^"]+)"', attrs)
        if not dm:
            return m.group(0)
        idm = re.search(r'\sid="([^"]+)"', attrs)
        if not is_lumen([idm.group(1) if idm else ""] + stack):
            return m.group(0)
        new_d = handler(dm.group(1))
        if new_d is None:
            return m.group(0)
        hit.append(idm.group(1) if idm else "")
        return m.group(0).replace(dm.group(0), f' d="{new_d}"')

    return re.sub(r"<(/?g|path)((?:\s+[a-zA-Z:-]+=\"[^\"]*\")*)", repl, txt), hit


def clamp_lumen_apex(txt: str, apex: float, margin: float = 1.0):
    """No lumen may stand outside the root apex.

    Needed because the SOURCE drawings already do it: on the canine the pulp
    reaches two units past the `tooth-base` contour. While roots were short it
    barely showed; once the generator STRETCHES a root to its measured
    proportion the overhang grows with it (canine: 2.00 -> 2.46 units) and the
    canal tip stands visibly clear of the tooth.

    Clamped per path and only in y, anchored at the lumen's coronal end - the
    chamber and the pulp horns stay where they are and only the canal tip
    retreats. Runs in FINAL coordinates, after the warp; running it before would
    miss the amplification.
    """

    def handler(d):
        ys = [p[1] for sub in _polylines(d) for p in sub]
        if not ys:
            return None
        y_top, y_bot = min(ys), max(ys)   # y_top = apical end; y grows occlusally
        limit = apex + margin
        if y_top >= limit:
            return None
        if y_bot <= limit:
            # The shape lies WHOLLY beyond the apex, so there is no coronal end
            # to anchor and scaling toward it would be degenerate. It is moved
            # in instead. This cannot happen while a root is only transformed;
            # it appears once a root is grafted from a donor whose own lumen
            # overhangs (odontogram-ay4 takes the canine's root, and the canine
            # is the worst overhang in the sources).
            shift = limit - y_top
            return svgpath.warp_path_d(d, lambda x, y: (x, y + shift))
        k = (y_bot - limit) / (y_bot - y_top)
        return svgpath.warp_path_d(d, lambda x, y: (x, y_bot - (y_bot - y) * k))

    return _lumen_paths(txt, handler)


def crossings_at(d: str, y: float) -> list[float]:
    """Sorted x of every place the outline of ``d`` crosses the line ``y``.

    Lives here because this is where the adaptive flattening lives. Walking the
    command list and taking each segment's ENDPOINT instead measures a polygon
    through the Bezier anchors, which cost the molars a third of their measured
    width before it was found (odontogram-5ca).
    """
    xs = []
    for sub in _polylines(d):
        for (ax, ay), (bx, by) in zip(sub, sub[1:]):
            if (ay <= y < by) or (by <= y < ay):
                t = (y - ay) / (by - ay)
                xs.append(ax + t * (bx - ax))
    xs.sort()
    return xs
