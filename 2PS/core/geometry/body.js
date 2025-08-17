import Vector from '../util/vector.js'

class Body {
  constructor(center) {
    this.center = center
    this.mass = 1
    this.inertia = 5000
    this.vertices = []
    this.velocity = new Vector(0, 0)
    this.acceleration = new Vector(0, 0)
    this.angularVelocity = 0
    this.angularAcceleration = 0
    this.angle = 0
    this.bounce = 1
    this.friction = 0.1
  }

  get inverseMass() {
    if (this.mass == 0) return 0
    else return 1 / this.mass
  }

  _MomentIntegration(dt) {
    this.velocity = this.velocity.AddScaled(this.acceleration, dt)
    this.center = this.center.AddScaled(this.velocity, dt)
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i] = this.vertices[i].AddScaled(this.velocity, dt)
    }
    this.angularVelocity += this.angularAcceleration * dt
    this.Rotate(this.angularVelocity * dt)
  }

  Rotate(angle, center = this.center) {
    this.angle += angle
    this.center = this.center.Rotate(angle, center)
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i] = this.vertices[i].Rotate(angle, center)
    }
  }

  Translate(vector) {
    this.center = this.center.Add(vector)
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i] = this.vertices[i].Add(vector)
    }
  }
  _GetFaceNormals() {
    let fn = []
    for (let i = 0; i < this.vertices.length; i++) {
      fn[i] = this.vertices[(i + 1) % this.vertices.length]
        .Sub(this.vertices[i])
        .Perp()
        .Unit()
    }
    return fn
  }

  _FindSupportPoint(n, ptOnEdge) {
    let max = -Infinity
    let index = false
    for (let i = 0; i < this.vertices.length; i++) {
      let v = this.vertices[i].Sub(ptOnEdge)
      let proj = Vector.Dot(n, v)
      if (proj > 0 && proj > max) {
        max = proj
        index = i
      }
    }
    return { sp: this.vertices[index], depth: max, n: n }
  }

  Draw(c) {
    c.save()
    c.strokeStyle = 'white'
    c.lineWidth = 2
    c.beginPath()
    for (let i = 0; i < this.vertices.length; i++) {
      c.moveTo(this.vertices[i].x, this.vertices[i].y)
      c.lineTo(
        this.vertices[(i + 1) % this.vertices.length].x,
        this.vertices[(i + 1) % this.vertices.length].y
      )
    }
    c.closePath()
    c.stroke()
    c.restore()
  }
}

export default Body
