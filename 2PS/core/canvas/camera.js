import Vector from '../util/vector.js'
import Body from '../geometry/body.js'

class Camera {
  constructor(params) {
    this.pos = params.position || new Vector(0, 0)
    this.zoom = params.zoom || 1
    this.c = params.c
    this.offSet = params.offSet || {
      x: this.c.canvas.width / 2,
      y: this.c.canvas.height / 2,
    }
    this.worldWidth = params.worldWidth || 1000
    this.worldHeight = params.worldHeight || 1000
    this.target = params.target || new Body(new Vector(0, 0))
    this.lockCamera = params.lockCamera || false
    this.freeLook = params.freeLook || false
    document.addEventListener('keydown', (e) => {
      if (e.key === 'q') {
        this.zoom *= 1.1
      } else if (e.key === 'e') {
        this.zoom /= 1.1
      } else if (e.key === 't') {
        this.freeLook = !this.freeLook
      } else if (e.key === 'a') {
        this.pos.x += 10 / this.zoom
      } else if (e.key === 'd') {
        this.pos.x -= 10 / this.zoom
      } else if (e.key === 'w') {
        this.pos.y += 10 / this.zoom
      } else if (e.key === 's') {
        this.pos.y -= 10 / this.zoom
      }
    })
  }

  Update() {
    if (this.lockCamera) {
      if (this.pos.y > 0) this.pos.y = 0
      if (this.pos.x > 0) this.pos.x = 0
      if (-this.pos.y + (this.offSet.y * 2) / this.zoom > this.worldHeight)
        this.pos.y = -(this.worldHeight - (this.offSet.y * 2) / this.zoom)
      if (-this.pos.x + (this.offSet.x * 2) / this.zoom > this.worldWidth)
        this.pos.x = -(this.worldWidth - (this.offSet.x * 2) / this.zoom)
    }
  }

  SetTarget(target) {
    this.target = target
  }

  LookAt(vector) {
    let ent = new Body(vector)
    this.target = ent
  }

  Follow() {
    if (this.freeLook) return
    let finalX = -this.target.center.x + this.offSet.x / this.zoom
    let finalY = -this.target.center.y + this.offSet.y / this.zoom
    let tar = new Vector(finalX, finalY)
    let v = tar.Sub(this.pos)
    v.x *= 0.05
    v.y *= 0.05
    this.pos = this.pos.Add(v)
  }

  Start(z = 1) {
    this.c.save()
    this.c.scale(this.zoom, this.zoom)
    this.c.translate(this.pos.x / z, this.pos.y / z)
  }

  End() {
    this.c.restore()
  }

  ToWorldSpace(vector) {
    return vector.Add(this.pos).Scale(1 / this.zoom)
  }

  ToCameraSpace(vector) {
    return vector.Scale(this.zoom).Sub(this.pos)
  }

  Draw(cb, z) {
    this.Start(z)
    cb()
    this.End()
  }

  static CamDraw(cam, cb, z) {
    cam.Start(z)
    cb()
    cam.End()
  }
}

export default Camera
