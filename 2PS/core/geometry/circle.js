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
  }

  draw(ctx) {
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
