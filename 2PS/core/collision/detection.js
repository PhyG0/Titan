import Vector from '../util/vector.js'
import { isEqual, ClipEdges } from '../util/math.js'

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
    spInfo.edge = i 
    e1SupportPoints.push(spInfo)
  }
  let e2SupportPoints = []
  for (let i = 0; i < e2FaceNormals.length; i++) {
    let spInfo = e1._FindSupportPoint(
      e2FaceNormals[i].Scale(-1),
      e2.vertices[i]
    )
    if (spInfo.sp == undefined) return [{ collide: false }]
    spInfo.edge = i
    e2SupportPoints.push(spInfo)
  }
  let result = e1SupportPoints.concat(e2SupportPoints)
  let min = Infinity
  let index = null
  let index2 = null 
  for (let i = 0; i < result.length; i++) {
    if (result[i].depth < min) {
      min = result[i].depth
      index = i
    }else if(isEqual(result[i].depth, min)) {
      index2 = i 
    }
  }

  let v = e2.center.Sub(e1.center)
  if (Vector.Dot(v, result[index].n) > 0) {
    result[index].n = result[index].n.Scale(-1)
  }
  result[index].collide = true


  if(!result[index2]) {
    return [result[index]]
  }

  // Two contact points

  let edge1 = result[index].edge
  let edge2 = result[index2].edge

  let points = ClipEdges(
    e1.vertices[edge1],
    e1.vertices[(edge1 + 1) % e1.vertices.length],
    e2.vertices[edge2],
    e2.vertices[(edge2 + 1) % e2.vertices.length],
    e1.vertices,
    e2.vertices
  )

  if(points.length < 2) {
    return [result[index]]
  }

  result[index].sp = points[0];
  result[index2].sp = points[1]

  let v2 = e2.center.Sub(e1.center)
  if (Vector.Dot(v2, result[index2].n) > 0) {
    result[index2].n = result[index2].n.Scale(-1)
  }
    result[index2].collide = true

    return [result[index], result[index2]]

}


export function Detect(e1, e2){
    let detection;
    if(e1.type == "polygon" && e2.type == "polygon"){
        detection =  DetectPolyVsPoly(e1, e2);
    }
    if(e1.type == "polygon" && e2.type == "circle"){
        detection = DetectPolyVsCircle(e1, e2);
        if(detection[0].collide){
            detection[0].n = detection[0].n.Scale(-1);
        }
    }
    if(e1.type == "circle" && e2.type == "polygon"){
        detection = DetectPolyVsCircle(e2, e1);
    }
    if(e1.type == "circle" && e2.type == "circle"){
        detection = DetectCircleVsCircle(e1, e2);
    }
    if(detection) return detection;
    return [{ collide : false }];
}

