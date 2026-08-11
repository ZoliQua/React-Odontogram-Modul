"""Parse, subdivide, transform, and compactly serialize SVG path data."""

from __future__ import annotations

import math
import re

NUM_RE = re.compile(r"[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?")
CMD_RE = re.compile(r"([MmZzLlHhVvCcSsQqTtAa])")
ARGC = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "A": 7, "Z": 0}


def tokenize(d: str):

    out = []
    parts = CMD_RE.split(d)
    i = 1
    while i < len(parts):
        cmd = parts[i]
        args = (
            [float(x) for x in NUM_RE.findall(parts[i + 1])]
            if i + 1 < len(parts)
            else []
        )
        n = ARGC[cmd.upper()]
        if n == 0:
            out.append((cmd, []))
        elif not args:
            pass
        else:
            c = cmd
            for j in range(0, len(args) - n + 1, n):
                out.append((c, args[j : j + n]))
                if c == "M":
                    c = "L"
                elif c == "m":
                    c = "l"
        i += 2
    return out


def _arc_to_cubics(p0, rx, ry, phi_deg, large_arc, sweep, p1):

    x0, y0 = p0
    x1, y1 = p1
    if rx == 0 or ry == 0 or (abs(x0 - x1) < 1e-12 and abs(y0 - y1) < 1e-12):
        return [("L", [x1, y1])]
    phi = math.radians(phi_deg)
    cosp, sinp = math.cos(phi), math.sin(phi)
    dx2, dy2 = (x0 - x1) / 2.0, (y0 - y1) / 2.0
    x1p = cosp * dx2 + sinp * dy2
    y1p = -sinp * dx2 + cosp * dy2
    rx, ry = abs(rx), abs(ry)
    lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry)
    if lam > 1:
        s = math.sqrt(lam)
        rx, ry = rx * s, ry * s
    num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
    den = rx * rx * y1p * y1p + ry * ry * x1p * x1p
    co = math.sqrt(max(0.0, num / den)) if den else 0.0
    if large_arc == sweep:
        co = -co
    cxp = co * rx * y1p / ry
    cyp = -co * ry * x1p / rx
    cx = cosp * cxp - sinp * cyp + (x0 + x1) / 2.0
    cy = sinp * cxp + cosp * cyp + (y0 + y1) / 2.0

    def ang(ux, uy, vx, vy):
        dot = ux * vx + uy * vy
        n = math.hypot(ux, uy) * math.hypot(vx, vy)
        a = math.acos(max(-1.0, min(1.0, dot / n))) if n else 0.0
        return -a if ux * vy - uy * vx < 0 else a

    th0 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dth = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
    if not sweep and dth > 0:
        dth -= 2 * math.pi
    elif sweep and dth < 0:
        dth += 2 * math.pi

    def pt(theta):
        c, s = math.cos(theta), math.sin(theta)
        return (cosp * rx * c - sinp * ry * s + cx, sinp * rx * c + cosp * ry * s + cy)

    def deriv(theta):
        c, s = math.cos(theta), math.sin(theta)
        return (-cosp * rx * s - sinp * ry * c, -sinp * rx * s + cosp * ry * c)

    segs = max(1, int(math.ceil(abs(dth) / (math.pi / 2))))
    step = dth / segs
    alpha = (4.0 / 3.0) * math.tan(step / 4.0)
    out = []
    th = th0
    for _ in range(segs):
        the = th + step
        p_a, p_b = pt(th), pt(the)
        d_a, d_b = deriv(th), deriv(the)
        c1 = (p_a[0] + alpha * d_a[0], p_a[1] + alpha * d_a[1])
        c2 = (p_b[0] - alpha * d_b[0], p_b[1] - alpha * d_b[1])
        out.append(("C", [c1[0], c1[1], c2[0], c2[1], p_b[0], p_b[1]]))
        th = the
    return out


def to_absolute(d: str):
    cur = (0.0, 0.0)
    start = (0.0, 0.0)
    prev_c = None
    prev_q = None
    out = []
    for cmd, a in tokenize(d):
        u = cmd.upper()
        rel = cmd.islower()
        ox, oy = cur if rel else (0.0, 0.0)
        if u == "M":
            cur = (a[0] + ox, a[1] + oy)
            start = cur
            out.append(("M", [cur[0], cur[1]]))
            prev_c = prev_q = None
        elif u == "Z":
            out.append(("Z", []))
            cur = start
            prev_c = prev_q = None
        elif u == "L":
            cur = (a[0] + ox, a[1] + oy)
            out.append(("L", [cur[0], cur[1]]))
            prev_c = prev_q = None
        elif u == "H":
            cur = (a[0] + ox, cur[1])
            out.append(("L", [cur[0], cur[1]]))
            prev_c = prev_q = None
        elif u == "V":
            cur = (cur[0], a[0] + oy)
            out.append(("L", [cur[0], cur[1]]))
            prev_c = prev_q = None
        elif u == "C":
            c1 = (a[0] + ox, a[1] + oy)
            c2 = (a[2] + ox, a[3] + oy)
            p = (a[4] + ox, a[5] + oy)
            out.append(("C", [c1[0], c1[1], c2[0], c2[1], p[0], p[1]]))
            prev_c, cur, prev_q = c2, p, None
        elif u == "S":
            c1 = (2 * cur[0] - prev_c[0], 2 * cur[1] - prev_c[1]) if prev_c else cur
            c2 = (a[0] + ox, a[1] + oy)
            p = (a[2] + ox, a[3] + oy)
            out.append(("C", [c1[0], c1[1], c2[0], c2[1], p[0], p[1]]))
            prev_c, cur, prev_q = c2, p, None
        elif u == "Q":
            q = (a[0] + ox, a[1] + oy)
            p = (a[2] + ox, a[3] + oy)
            c1 = (
                cur[0] + 2.0 / 3.0 * (q[0] - cur[0]),
                cur[1] + 2.0 / 3.0 * (q[1] - cur[1]),
            )
            c2 = (p[0] + 2.0 / 3.0 * (q[0] - p[0]), p[1] + 2.0 / 3.0 * (q[1] - p[1]))
            out.append(("C", [c1[0], c1[1], c2[0], c2[1], p[0], p[1]]))
            prev_q, cur, prev_c = q, p, c2
        elif u == "T":
            q = (2 * cur[0] - prev_q[0], 2 * cur[1] - prev_q[1]) if prev_q else cur
            p = (a[0] + ox, a[1] + oy)
            c1 = (
                cur[0] + 2.0 / 3.0 * (q[0] - cur[0]),
                cur[1] + 2.0 / 3.0 * (q[1] - cur[1]),
            )
            c2 = (p[0] + 2.0 / 3.0 * (q[0] - p[0]), p[1] + 2.0 / 3.0 * (q[1] - p[1]))
            out.append(("C", [c1[0], c1[1], c2[0], c2[1], p[0], p[1]]))
            prev_q, cur, prev_c = q, p, c2
        elif u == "A":
            p = (a[5] + ox, a[6] + oy)
            for seg in _arc_to_cubics(cur, a[0], a[1], a[2], int(a[3]), int(a[4]), p):
                out.append(seg)
            cur = p
            prev_c = prev_q = None
    return out


def _split_cubic(p0, c1, c2, p3, t=0.5):
    def lerp(a, b, s):
        return (a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s)

    a1 = lerp(p0, c1, t)
    a2 = lerp(c1, c2, t)
    a3 = lerp(c2, p3, t)
    b1 = lerp(a1, a2, t)
    b2 = lerp(a2, a3, t)
    m = lerp(b1, b2, t)
    return (p0, a1, b1, m), (m, b2, a3, p3)


def subdivide(cmds, max_dy: float):

    out = []
    cur = (0.0, 0.0)
    start = (0.0, 0.0)
    for cmd, a in cmds:
        if cmd == "M":
            cur = (a[0], a[1])
            start = cur
            out.append((cmd, a))
        elif cmd == "Z":
            out.append((cmd, a))
            cur = start
        elif cmd == "L":
            out.append((cmd, a))
            cur = (a[0], a[1])
        elif cmd == "C":
            p0 = cur
            c1, c2, p3 = (a[0], a[1]), (a[2], a[3]), (a[4], a[5])
            stack = [(p0, c1, c2, p3)]
            done = []
            guard = 0
            while stack and guard < 4096:
                guard += 1
                seg = stack.pop()
                ys = [seg[0][1], seg[1][1], seg[2][1], seg[3][1]]
                if max(ys) - min(ys) > max_dy:
                    left, right = _split_cubic(*seg)
                    stack.append(right)
                    stack.append(left)
                else:
                    done.append(seg)
            for seg in done:
                out.append(
                    (
                        "C",
                        [
                            seg[1][0],
                            seg[1][1],
                            seg[2][0],
                            seg[2][1],
                            seg[3][0],
                            seg[3][1],
                        ],
                    )
                )
            cur = p3
    return out


def transform_cmds(cmds, fn):
    out = []
    for cmd, a in cmds:
        if cmd == "Z":
            out.append((cmd, []))
            continue
        pts = [(a[i], a[i + 1]) for i in range(0, len(a), 2)]
        moved = [fn(x, y) for x, y in pts]
        flat = []
        for x, y in moved:
            flat.extend([x, y])
        out.append((cmd, flat))
    return out


def _fmt(v: float, prec: int) -> str:
    s = f"{v:.{prec}f}"
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    if s in ("-0", ""):
        s = "0"
    if s.startswith("0.") and len(s) > 2:
        s = s[1:]
    elif s.startswith("-0.") and len(s) > 3:
        s = "-" + s[2:]
    return s


def _join(tokens) -> str:

    out = ""
    prev = None
    for t in tokens:
        if prev is None:
            out = t
        elif t.startswith("-"):
            out += t
        elif t.startswith(".") and "." in prev:
            out += t
        else:
            out += "," + t
        prev = t
    return out


def serialize(cmds, prec: int = 2) -> str:

    parts = []
    cur = (0.0, 0.0)
    start = (0.0, 0.0)
    last_cmd = None
    last_tok = ""
    for cmd, a in cmds:
        if cmd == "Z":
            parts.append("Z")
            cur = start
            last_cmd = "Z"
            last_tok = ""
            continue
        if cmd == "M":
            rel = (a[0] - cur[0], a[1] - cur[1])
            nums = [rel[0], rel[1]] if last_cmd is not None else [a[0], a[1]]
            letter = "m" if last_cmd is not None else "M"
            cur = (a[0], a[1])
            start = cur
        elif cmd == "L":
            dx, dy = a[0] - cur[0], a[1] - cur[1]
            if abs(dy) < 10 ** (-prec) / 2:
                letter, nums = "h", [dx]
            elif abs(dx) < 10 ** (-prec) / 2:
                letter, nums = "v", [dy]
            else:
                letter, nums = "l", [dx, dy]
            cur = (a[0], a[1])
        else:
            nums = [
                a[0] - cur[0],
                a[1] - cur[1],
                a[2] - cur[0],
                a[3] - cur[1],
                a[4] - cur[0],
                a[5] - cur[1],
            ]
            letter = "c"
            cur = (a[4], a[5])
        toks = [_fmt(v, prec) for v in nums]

        if letter == last_cmd and letter not in ("m", "M"):
            parts.append(_join([last_tok] + toks)[len(last_tok) :])
        else:
            parts.append(letter + _join(toks))
        last_cmd = letter
        last_tok = toks[-1]
    return "".join(parts)


def _bez(p0, c1, c2, p3, t):
    mt = 1 - t
    return (
        mt**3 * p0[0] + 3 * mt * mt * t * c1[0] + 3 * mt * t * t * c2[0] + t**3 * p3[0],
        mt**3 * p0[1] + 3 * mt * mt * t * c1[1] + 3 * mt * t * t * c2[1] + t**3 * p3[1],
    )


def subdivide_for_warp(cmds, fn, tol: float = 0.02, depth: int = 12):

    out = []
    cur = (0.0, 0.0)
    start = (0.0, 0.0)

    def emit(p0, c1, c2, p3, lvl):
        w0, w1, w2, w3 = fn(*p0), fn(*c1), fn(*c2), fn(*p3)
        err = 0.0
        for t in (0.25, 0.5, 0.75):
            tx, ty = fn(*_bez(p0, c1, c2, p3, t))
            ax, ay = _bez(w0, w1, w2, w3, t)
            err = max(err, math.hypot(tx - ax, ty - ay))
        if err <= tol or lvl >= depth:
            out.append(("C", [c1[0], c1[1], c2[0], c2[1], p3[0], p3[1]]))
            return
        left, right = _split_cubic(p0, c1, c2, p3)
        emit(*left, lvl + 1)
        emit(*right, lvl + 1)

    for cmd, a in cmds:
        if cmd == "M":
            cur = (a[0], a[1])
            start = cur
            out.append((cmd, a))
        elif cmd == "Z":
            out.append((cmd, a))
            cur = start
        elif cmd == "L":
            p3 = (a[0], a[1])
            c1 = (cur[0] + (p3[0] - cur[0]) / 3.0, cur[1] + (p3[1] - cur[1]) / 3.0)
            c2 = (
                cur[0] + 2 * (p3[0] - cur[0]) / 3.0,
                cur[1] + 2 * (p3[1] - cur[1]) / 3.0,
            )
            before = len(out)
            emit(cur, c1, c2, p3, 0)
            if len(out) - before == 1:
                out[-1] = ("L", [p3[0], p3[1]])
            cur = p3
        elif cmd == "C":
            p3 = (a[4], a[5])
            emit(cur, (a[0], a[1]), (a[2], a[3]), p3, 0)
            cur = p3
    return out


def warp_path_d(d: str, fn, tol: float = 0.05, prec: int = 2) -> str:

    cmds = to_absolute(d)
    cmds = subdivide_for_warp(cmds, fn, tol)
    cmds = transform_cmds(cmds, fn)
    return serialize(cmds, prec)
