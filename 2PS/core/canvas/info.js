class InfoBox {
  constructor(ctx, position = { x: 0, y: 0 }, info = {}) {
    this.ctx = ctx
    this.info = info
    this.position = position
    this.padding = 16
    this.lineHeight = 24
    this.fontSize = 14
    this.cornerRadius = 12
    this.shadowBlur = 20
    this.minWidth = 200
    this.maxWidth = 400
  }

  addInfo(key, value) {
    this.info[key] = value
  }

  removeInfo(key) {
    if (this.info.hasOwnProperty(key)) {
      delete this.info[key]
    }
  }

  // Calculate text width for dynamic sizing
  measureText(text) {
    this.ctx.font = `${this.fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    return this.ctx.measureText(text).width
  }

  // Calculate optimal box dimensions
  calculateDimensions() {
    const entries = Object.entries(this.info)
    if (entries.length === 0)
      return { width: this.minWidth, height: this.padding * 2 }

    let maxWidth = 0
    entries.forEach(([key, value]) => {
      const text = `${key}: ${value}`
      const textWidth = this.measureText(text)
      maxWidth = Math.max(maxWidth, textWidth)
    })

    const width = Math.max(
      this.minWidth,
      Math.min(this.maxWidth, maxWidth + this.padding * 2)
    )
    const height = entries.length * this.lineHeight + this.padding * 2

    return { width, height }
  }

  // Draw rounded rectangle with gradient
  drawRoundedRect(x, y, width, height) {
    const ctx = this.ctx
    const radius = this.cornerRadius

    // Shadow
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = this.shadowBlur
    ctx.shadowOffsetY = 8

    // Background gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height)
    gradient.addColorStop(0, 'rgba(20, 24, 32, 0.95)')
    gradient.addColorStop(1, 'rgba(12, 16, 24, 0.98)')
    ctx.fillStyle = gradient

    // Draw rounded rectangle
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // Border highlight
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + radius, y + 0.5)
    ctx.lineTo(x + width - radius, y + 0.5)
    ctx.quadraticCurveTo(x + width - 0.5, y + 0.5, x + width - 0.5, y + radius)
    ctx.lineTo(x + width - 0.5, y + height - radius)
    ctx.quadraticCurveTo(
      x + width - 0.5,
      y + height - 0.5,
      x + width - radius,
      y + height - 0.5
    )
    ctx.lineTo(x + radius, y + height - 0.5)
    ctx.quadraticCurveTo(
      x + 0.5,
      y + height - 0.5,
      x + 0.5,
      y + height - radius
    )
    ctx.lineTo(x + 0.5, y + radius)
    ctx.quadraticCurveTo(x + 0.5, y + 0.5, x + radius, y + 0.5)
    ctx.stroke()
    ctx.restore()
  }

  // Draw text with better typography
  drawText(entries, boxX, boxY, boxWidth) {
    const ctx = this.ctx

    entries.forEach(([key, value], index) => {
      const y = boxY + this.padding + index * this.lineHeight + 16

      // Key styling (label)
      ctx.font = `600 ${this.fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'

      const keyText = `${key}:`
      const keyWidth = this.measureText(keyText)
      ctx.fillText(keyText, boxX + this.padding, y)

      // Value styling
      ctx.font = `400 ${this.fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'

      const valueText = ` ${value}`
      ctx.fillText(valueText, boxX + this.padding + keyWidth, y)

      // Subtle separator line (except for last item)
      if (index < entries.length - 1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(boxX + this.padding, y + this.lineHeight / 2)
        ctx.lineTo(boxX + boxWidth - this.padding, y + this.lineHeight / 2)
        ctx.stroke()
      }
    })
  }

  draw() {
    const entries = Object.entries(this.info)
    if (entries.length === 0) return

    const { width, height } = this.calculateDimensions()
    const boxX = this.position.x
    const boxY = this.position.y

    // Save context state
    this.ctx.save()

    // Draw the box
    this.drawRoundedRect(boxX, boxY, width, height)

    // Draw the text
    this.drawText(entries, boxX, boxY, width)

    // Restore context state
    this.ctx.restore()
  }

  // Utility method to update position
  setPosition(x, y) {
    this.position.x = x
    this.position.y = y
  }

  // Utility method to check if point is inside the box
  containsPoint(x, y) {
    const { width, height } = this.calculateDimensions()
    return (
      x >= this.position.x &&
      x <= this.position.x + width &&
      y >= this.position.y &&
      y <= this.position.y + height
    )
  }
}

export default InfoBox
