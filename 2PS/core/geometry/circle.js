import Vector from '../util/vector.js'
import Body from './body.js'

class Circle extends Body {
  constructor(
    center = new Vector(0, 0),
    radius = 40,
    config = {
      fillStyle: 'red',
      strokeStyle: 'black',
      lineWidth: 3,
      fill: false,
    }
  ) {
    super(center)
    this.radius = radius
    this.config = config
    this.type = 'circle'
    this.boundingRect = {
      width: 2.3 * this.radius,
      height: 2.3 * this.radius,
    }
  }
  _FindSupportPoint(n, ep) {
    let circVerts = []
    circVerts[0] = this.center.Add(n.Scale(this.radius))
    circVerts[1] = this.center.Add(n.Scale(-this.radius))
    let max = -Infinity
    let index = null
    for (let i = 0; i < circVerts.length; i++) {
      let v = circVerts[i].Sub(ep)
      let proj = Vector.Dot(v, n)
      if (proj > 0 && proj > max) {
        max = proj
        index = i
      }
    }
    return { sp: circVerts[index], depth: max, n: n }
  }

  _FindNearestVertex(verts) {
    let max = Infinity
    let index = null
    for (let i = 0; i < verts.length; i++) {
      let v = verts[i].Sub(this.center)
      let dist = v.LengthSquared()
      if (dist < max) {
        max = dist
        index = i
      }
    }
    return verts[index]
  }
  Draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.config.fillStyle
    if (this.config.fill) ctx.fill()
    ctx.stroke()
    ctx.lineWidth = this.config.lineWidth
    ctx.strokeStyle = this.config.strokeStyle
    ctx.stroke()
  }
}

export default Circle
