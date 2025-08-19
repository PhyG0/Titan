import Vector from '../util/vector.js'

class Body {
  constructor(center) {
    this.center = center
    this.mass = 1
    this.inertia = 5000
    this.vertices = []
    this.velocity = new Vector(0, 0)
    this.angularVelocity = 0
    this.angle = 0
    this.bounce = 0.5
    this.friction = 0.1
    this.isStatic = false;
    if(this.mass == 0) this.isStatic = true;

    this.forceAccumulator = new Vector(0, 0)
    this.torqueAccumulator = 0
  }
  
  get inverseMass() {
    return this.mass === 0 ? 0 : 1 / this.mass
  }

  get inverseInertia() {
    return this.inertia === 0 ? 0 : 1 / this.inertia
  }

  // ------------------------------
  // Semi-implicit Euler integration
  // ------------------------------
  IntegrateEuler(dt) {
    // Linear
    let acceleration = this.forceAccumulator.Scale(this.inverseMass)
    this.velocity = this.velocity.AddScaled(acceleration, dt)
    this.center = this.center.AddScaled(this.velocity, dt)

    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i] = this.vertices[i].AddScaled(this.velocity, dt)
    }

    // Angular
    let angularAcceleration = this.torqueAccumulator * this.inverseInertia
    this.angularVelocity += angularAcceleration * dt
    this.Rotate(this.angularVelocity * dt)

    // Clear accumulators
    this.forceAccumulator = new Vector(0, 0)
    this.torqueAccumulator = 0
  }

  // ------------------------------
  // Runge–Kutta 4 integration
  // ------------------------------
  IntegrateRK4(dt) {
    // Helper function for derivatives\
    const derivative = (state, dt, d) => {
      let newState = {
        center: state.center.AddScaled(d.velocity, dt),
        velocity: state.velocity.AddScaled(d.acceleration, dt),
        angle: state.angle + d.angularVelocity * dt,
        angularVelocity: state.angularVelocity + d.angularAcceleration * dt
      }

      let acc = this.forceAccumulator.Scale(this.inverseMass)
      let angAcc = this.torqueAccumulator * this.inverseInertia

      return {
        velocity: newState.velocity,
        acceleration: acc,
        angularVelocity: newState.angularVelocity,
        angularAcceleration: angAcc
      }
    }

    let state = {
      center: this.center,
      velocity: this.velocity,
      angle: this.angle,
      angularVelocity: this.angularVelocity
    }

    // k1
    let a = {
      velocity: state.velocity,
      acceleration: this.forceAccumulator.Scale(this.inverseMass),
      angularVelocity: state.angularVelocity,
      angularAcceleration: this.torqueAccumulator * this.inverseInertia
    }

    // k2, k3, k4
    let b = derivative(state, dt * 0.5, a)
    let c = derivative(state, dt * 0.5, b)
    let d = derivative(state, dt, c)

    // Weighted sums
    let dxdt = state.velocity
      .Add(a.velocity)
      .AddScaled(b.velocity, 2)
      .AddScaled(c.velocity, 2)
      .Add(d.velocity)
      .Scale(dt / 6)

    let dvdt = a.acceleration
      .AddScaled(b.acceleration, 2)
      .AddScaled(c.acceleration, 2)
      .Add(d.acceleration)
      .Scale(dt / 6)

    let dAngle = (a.angularVelocity + 2 * b.angularVelocity + 2 * c.angularVelocity + d.angularVelocity) * (dt / 6)
    let dAngularVel = (a.angularAcceleration + 2 * b.angularAcceleration + 2 * c.angularAcceleration + d.angularAcceleration) * (dt / 6)

    // Apply updates
    this.center = this.center.Add(dxdt)
    this.velocity = this.velocity.Add(dvdt)
    this.angle += dAngle
    this.angularVelocity += dAngularVel
    this.Rotate(dAngle)

    // Clear accumulators
    this.forceAccumulator = new Vector(0, 0)
    this.torqueAccumulator = 0
  }


  _MomentIntegration(dt) {
    this.IntegrateRK4(dt)
    this.velocity = this.velocity.Scale(0.99)
    this.angularVelocity *= 0.999
  }

  AddForce(force, point = null) {
    this.forceAccumulator = this.forceAccumulator.Add(force)

    if (point) {
      let r = point.Sub(this.center)
      let torque = Vector.Cross(r, force) // scalar torque
      this.torqueAccumulator += torque
    }
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
    c.fillStyle = 'gray';
    c.lineWidth = 2
    c.beginPath()
    c.moveTo(this.vertices[0].x, this.vertices[0].y)
    for (let i = 0; i < this.vertices.length; i++) {
      c.lineTo(
        this.vertices[(i + 1) % this.vertices.length].x,
        this.vertices[(i + 1) % this.vertices.length].y
      )
    }
    c.closePath()
    c.stroke()
    if(this.isStatic) c.fill()
    c.restore()
  }
}

export default Body
