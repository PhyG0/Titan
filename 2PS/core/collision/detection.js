import Vector from '../util/vector.js'

export function DetectCircleVsCircle(e1, e2) {
  let rSum = e1.radius + e2.radius
  let vFrom1to2 = e2.center.Sub(e1.center)
  if (vFrom1to2.LengthSquared() < Math.pow(rSum, 2)) {
    let d = rSum - vFrom1to2.Length()
    let n = vFrom1to2.Unit()
    let sp = e1.center.Add(n.Scale(e1.radius))
    if (Vector.Dot(vFrom1to2, n) > 0) {
      n = n.Scale(-1)
    }
    return [
      {
        sp: sp,
        n: n,
        depth: d,
        collide: true,
      },
    ]
  } else {
    return [{ collide: false }]
  }
}
