import Body from './body.js'
import Vector from '../util/vector.js'

class Rectangle extends Body {
  constructor(center, width, height) {
    super(center)
    this.width = width
    this.height = height
    this.vertices = [
      new Vector(
        this.center.x - this.width / 2,
        this.center.y - this.height / 2
      ),
      new Vector(
        this.center.x + this.width / 2,
        this.center.y - this.height / 2
      ),
      new Vector(
        this.center.x + this.width / 2,
        this.center.y + this.height / 2
      ),
      new Vector(
        this.center.x - this.width / 2,
        this.center.y + this.height / 2
      ),
    ]
    this.type = 'polygon'
    this.inertia = this.mass * (this.width * this.width + this.height * this.height) / 12;
  }
}

export default Rectangle
