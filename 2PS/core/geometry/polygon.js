import Body from './body.js'
import Vector from '../util/vector.js'

class Polygon extends Body {
  constructor(center, n, size) {
    super(center)
    this.n = n
    this.size = size
    this.vertices = []
    let minX = Infinity,
      minY = Infinity
    let maxX = -Infinity,
      maxY = -Infinity
    this.type = 'polygon'
    for (let i = 0; i < n; i++) {
      this.vertices.push(
        new Vector(
          this.center.x + this.size * Math.cos(i * ((2 * Math.PI) / n)),
          this.center.y + this.size * Math.sin(i * ((2 * Math.PI) / n))
        )
      )
      if (this.vertices[i].x < minX) minX = this.vertices[i].x
      if (this.vertices[i].y < minY) minY = this.vertices[i].y
      if (this.vertices[i].x > maxX) maxX = this.vertices[i].x
      if (this.vertices[i].y > maxY) maxY = this.vertices[i].y
    }
    this.boundingRect = {
      width: 2 * this.size,
      height: 2 * this.size,
    }
  }
}

export default Polygon
