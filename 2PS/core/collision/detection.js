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

export function DetectPolyVsCircle(e1, e2) {
  let e1FaceNormals = e1._GetFaceNormals()
  let e1SupportPoints = []
  for (let i = 0; i < e1FaceNormals.length; i++) {
    let spInfo1 = e2._FindSupportPoint(
      e1FaceNormals[i].Scale(-1),
      e1.vertices[i]
    )
    if (spInfo1.sp == undefined) return [{ collide: false }]
    e1SupportPoints[i] = spInfo1
  }
  let normal = e1.center.Sub(e2.center).Unit().Scale(-1)
  let info = e1._FindSupportPoint(
    normal,
    e2.center.Add(normal.Scale(-e2.radius))
  )
  if (info.sp == undefined) return [{ collide: false }]
  e1SupportPoints.push(info)
  let max = Infinity
  let index = null
  for (let i = 0; i < e1SupportPoints.length; i++) {
    if (e1SupportPoints[i].depth < max) {
      max = e1SupportPoints[i].depth
      index = i
    }
  }
  let v = e2.center.Sub(e1.center)
  if (Vector.Dot(v, e1SupportPoints[index].n) < 0) {
    e1SupportPoints[index].n = e1SupportPoints[index].n.Scale(-1)
  }
  e1SupportPoints[index].collide = true
  return [e1SupportPoints[index]]
}

export function DetectPolyVsPoly(e1, e2) {
  let e1SupportPoints = []
  let e1FaceNormals = e1._GetFaceNormals()
  let e2FaceNormals = e2._GetFaceNormals()
  for (let i = 0; i < e1FaceNormals.length; i++) {
    let spInfo = e2._FindSupportPoint(
      e1FaceNormals[i].Scale(-1),
      e1.vertices[i]
    )
    if (spInfo.sp == undefined) return [{ collide: false }]
    e1SupportPoints[i] = spInfo
  }
  let e2SupportPoints = []
  for (let i = 0; i < e2FaceNormals.length; i++) {
    let spInfo = e1._FindSupportPoint(
      e2FaceNormals[i].Scale(-1),
      e2.vertices[i]
    )
    if (spInfo.sp == undefined) return [{ collide: false }]
    e2SupportPoints[i] = spInfo
  }
  let result = e1SupportPoints.concat(e2SupportPoints)
  let max = Infinity
  let index = null
  for (let i = 0; i < result.length; i++) {
    if (result[i].depth < max) {
      max = result[i].depth
      index = i
    }
  }
  let v = e2.center.Sub(e1.center)
  if (Vector.Dot(v, result[index].n) > 0) {
    result[index].n = result[index].n.Scale(-1)
  }
  result[index].collide = true
  return [result[index]]
}
