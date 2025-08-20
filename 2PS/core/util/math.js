import Vector from "./vector.js";

export function random(min, max) {
    return (max - min) * Math.random() + min;
}

export function pointInPolygon(px, py, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    let x1 = vertices[i].x;
    let y1 = vertices[i].y 
    let x2 = vertices[j].x;
    let y2 = vertices[j].y;

    let intersect = ((y1 > py) !== (y2 > py)) &&
      (px < (x2 - x1) * (py - y1) / (y2 - y1) + x1);

    if (intersect) inside = !inside;
  }
  return inside;
}

export function isEqual(value1, value2, error = 0.0001) {
    return value1 > (value2 - error) && value1 < (value2 + error)
}

export function ClipEdges(a1, a2, b1, b2, body1Vertices, body2Vertices) {
  let res = [];  
  if(pointInPolygon(a1.x, a1.y, body2Vertices)) {
    res.push(a1)
  }
  if(pointInPolygon(a2.x, a2.y, body2Vertices)) {
    res.push(a2)
  }
  if(pointInPolygon(b1.x, b1.y, body1Vertices)) {
    res.push(b1)
  }
  if(pointInPolygon(b2.x, b2.y, body1Vertices)) {
    res.push(b2)
  }

  return res;
}
