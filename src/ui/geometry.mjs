const PI2 = 2 * Math.PI;

export function distXY(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
}

export function dist(p1, p2) {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
}

export function distSquared(p1, p2) {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    return dx * dx + dy * dy;
}

export function getVersor(p1, p2) {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const d = Math.sqrt(dx * dx + dy * dy);
    if (dx === 0 && dy === 0) return [1, 0];
    return [dx / d, dy / d];
}

export function add(p1, p2) {
    return [
        p1[0] + p2[0],
        p1[1] + p2[1],
    ];
}

export function mulScalar(n, v) {
    return [n * v[0], n * v[1]];
}

export function getAngleFromVersor(p) {
    return Math.atan2(p[1], p[0])
}

export function getVersorFromAngle(ang) {
    return [Math.cos(ang), Math.sin(ang)];
}

export function rotate90Degrees(p) {
    return [p[1], -p[0]];
}

export function angleBetweenVersors(v1, v2) {
    let dAng = getAngleFromVersor(v2) - getAngleFromVersor(v1);
    if (dAng > Math.PI) dAng -= PI2;
    else if (dAng < -Math.PI) dAng += PI2;
    return dAng;
}

export function lerp(a, b, r) {
    return a * (1 - r) + b * r;
}

export function lerp2(a, b, r) {
    return [
        a[0] * (1 - r) + b[0] * r,
        a[1] * (1 - r) + b[1] * r
    ];
}

export function averagePoint(points) {
    const avg = [0, 0];
    for (const p of points) {
        avg[0] += p[0];
        avg[1] += p[1];
    }
    avg[0] /= points.length;
    avg[1] /= points.length;
    return avg;
}

export function nearestPoint(from, points) {
    let minDist = -1;
    let candidate = [0, 0];
    for (const p of points) {
        const dSq = distSquared(p, from);
        if (minDist === -1 || dSq < minDist) {
            candidate = p;
            minDist = dSq;
        }
    }
    return candidate;
}
