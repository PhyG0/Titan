import Vector from '../util/vector.js'

class Manifold {
  constructor() {
    this.points = []
    this.normal = new Vector(0, 0)
    this.depth = 0
  }

  show(camera, ctx) {
    camera.Draw(() => {
      for (let i = 0; i < this.points.length; i++) {
        this.points[i].drawAsDot(ctx, 'red')
      }

      // show normal
      ctx.beginPath()
      ctx.strokeStyle = 'green'
      ctx.lineWidth = 2
      ctx.moveTo(this.points[0].x, this.points[0].y)
      ctx.lineTo(
        this.points[0].x + this.normal.x * this.depth,
        this.points[0].y + this.normal.y * this.depth
      )
      ctx.stroke()
    })
  }
}

export default Manifold
