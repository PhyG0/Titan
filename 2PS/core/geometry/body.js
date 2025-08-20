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
    this.friction = 0.2
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
    // Store initial state
    const initialCenter = this.center.Copy()
    const initialVelocity = this.velocity.Copy()
    const initialAngle = this.angle
    const initialAngularVelocity = this.angularVelocity

    // Forces are constant over this timestep
    const acceleration = this.forceAccumulator.Scale(this.inverseMass)
    const angularAcceleration = this.torqueAccumulator * this.inverseInertia

    // k1 - derivatives at current state
    const k1 = {
      velocity: this.velocity.Copy(),
      acceleration: acceleration.Copy(),
      angularVelocity: this.angularVelocity,
      angularAcceleration: angularAcceleration
    }

    // k2 - derivatives at t + dt/2 using k1
    const k2 = {
      velocity: initialVelocity.AddScaled(k1.acceleration, dt * 0.5),
      acceleration: acceleration.Copy(),
      angularVelocity: initialAngularVelocity + k1.angularAcceleration * dt * 0.5,
      angularAcceleration: angularAcceleration
    }

    // k3 - derivatives at t + dt/2 using k2
    const k3 = {
      velocity: initialVelocity.AddScaled(k2.acceleration, dt * 0.5),
      acceleration: acceleration.Copy(),
      angularVelocity: initialAngularVelocity + k2.angularAcceleration * dt * 0.5,
      angularAcceleration: angularAcceleration
    }

    // k4 - derivatives at t + dt using k3
    const k4 = {
      velocity: initialVelocity.AddScaled(k3.acceleration, dt),
      acceleration: acceleration.Copy(),
      angularVelocity: initialAngularVelocity + k3.angularAcceleration * dt,
      angularAcceleration: angularAcceleration
    }

    // Calculate final changes using RK4 weighted average
    const deltaVelocity = k1.acceleration
      .AddScaled(k2.acceleration, 2)
      .AddScaled(k3.acceleration, 2)
      .Add(k4.acceleration)
      .Scale(dt / 6)

    const avgVelocity = k1.velocity
      .AddScaled(k2.velocity, 2)
      .AddScaled(k3.velocity, 2)
      .Add(k4.velocity)
      .Scale(1/6)

    const deltaPosition = avgVelocity.Scale(dt)

    const deltaAngularVelocity = (k1.angularAcceleration + 2*k2.angularAcceleration + 2*k3.angularAcceleration + k4.angularAcceleration) * (dt / 6)
    const avgAngularVelocity = (k1.angularVelocity + 2*k2.angularVelocity + 2*k3.angularVelocity + k4.angularVelocity) / 6
    const deltaAngle = avgAngularVelocity * dt

    // Apply updates using your existing methods
    this.velocity = initialVelocity.Add(deltaVelocity)
    this.angularVelocity = initialAngularVelocity + deltaAngularVelocity
    
    // Use your Translate and Rotate methods (they handle vertices automatically)
    this.Translate(deltaPosition)
    this.Rotate(deltaAngle, this.center)

    // Clear accumulators
    this.forceAccumulator = new Vector(0, 0)
    this.torqueAccumulator = 0
  }


  _MomentIntegration(dt) {
    // this.IntegrateEuler(dt)
    this.IntegrateRK4(dt);
    this.velocity = this.velocity.Scale(0.999)
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
      c.fontSize = 10;
      c.fillText(String(this.vertices[(i + 1) % this.vertices.length].x.toFixed(2)) + ", " + String(this.vertices[(i + 1) % this.vertices.length].y.toFixed(2)), this.vertices[(i + 1) % this.vertices.length].x, this.vertices[(i + 1) % this.vertices.length].y)
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
