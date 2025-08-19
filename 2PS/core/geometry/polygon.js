import Body from './body.js'
import Vector from '../util/vector.js'

class Polygon extends Body {
  constructor(center, n, size) {
    super(center)
    this.n = n
    this.size = size
    this.vertices = []
    this.type = 'polygon'
    for (let i = 0; i < n; i++) {
      this.vertices.push(
        new Vector(
          this.center.x + this.size * Math.cos(i * ((2 * Math.PI) / n)),
          this.center.y + this.size * Math.sin(i * ((2 * Math.PI) / n))
        )
      )
    }
    this.inertia = this.calculateInertia();
  }

  calculateInertia() {
      let area = 0;
      let inertia = 0;

      for (let i = 0; i < this.vertices.length; i++) {
          let j = (i + 1) % this.vertices.length;

          let xi = this.vertices[i].x - this.center.x;
          let yi = this.vertices[i].y - this.center.y;
          let xj = this.vertices[j].x - this.center.x;
          let yj = this.vertices[j].y - this.center.y;

          let cross = xi * yj - xj * yi;

          area += cross;

          inertia += cross * (
              xi * xi + xi * xj + xj * xj +
              yi * yi + yi * yj + yj * yj
          );
      }

      area *= 0.5;

      // Density = mass / area
      let density = this.mass / area;

      // Final polygon inertia about centroid
      inertia = (density / 12) * inertia;

      return Math.abs(inertia); 
  }


}

export default Polygon
