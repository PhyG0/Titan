class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  Add(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y)
  }
  Sub(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y)
  }
  Scale(k) {
    return new Vector(this.x * k, this.y * k)
  }
  Mult(vector) {
    return new Vector(this.x * vector.x, this.y * vector.y)
  }
  Angle() {
    return Math.atan2(this.y, this.x)
  }
  Clone() {
    return new Vector(this.x, this.y)
  }
  AddScaled(vector, k) {
    return new Vector(this.x + vector.x * k, this.y + vector.y * k)
  }
  Rotate(angle, center = new Vector(0, 0)) {
    let x = this.x - center.x
    let y = this.y - center.y
    let r = []
    r[0] = x * Math.cos(angle) - Math.sin(angle) * y
    r[1] = x * Math.sin(angle) + Math.cos(angle) * y
    r[0] += center.x
    r[1] += center.y
    return new Vector(r[0], r[1])
  }
  Length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  LengthSquared() {
    return Math.pow(this.x, 2) + Math.pow(this.y, 2)
  }
  Unit() {
    let length = this.Length()
    if (length == 0) return this
    else return new Vector(this.x / length, this.y / length)
  }
  Perp() {
    return new Vector(this.y, -this.x)
  }
  static AngleBetween(vector1, vector2) {
    return Math.acos(
      Vector.Dot(vector1, vector2) / (vector1.Length() * vector2.Length())
    )
  }
  static Dot(vector1, vector2) {
    return vector1.x * vector2.x + vector1.y * vector2.y
  }
  static Cross(vector1, vector2) {
    return vector1.x * vector2.y - vector1.y * vector2.x
  }
  static Average(array) {
    let sum = new Vector(0, 0)
    for (let i = 0; i < array.length; i++) {
      sum.x += array[i].x
      sum.y += array[i].y
    }
    sum = sum.Scale(1 / array.length)
    return sum
  }
  AddThis(vector) {
    this.x += vector.x
    this.y += vector.y
  }
  SubThis(vector) {
    this.x -= vector.x
    this.y -= vector.y
  }

  drawAsArrow(ctx, color) {
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x + this.Unit().x * 10, this.y + this.Unit().y * 10)
    ctx.strokeStyle = color
    ctx.stroke()
  }

  drawAsDot(ctx, color) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }
}

export default Vector
