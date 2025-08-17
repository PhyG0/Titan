import Screen from '../../2PS/core/canvas/screen.js'
import Circle from '../../2PS/core/geometry/circle.js'
import Vector from '../../2PS/core/util/vector.js'
import Camera from '../../2PS/core/canvas/camera.js'
import InfoBox from '../../2PS/core/canvas/info.js'
import Manifold from '../../2PS/core/collision/manifold.js'
import Rectangle from '../../2PS/core/geometry/rectangle.js'
import { DetectPolyVsCircle } from '../../2PS/core/collision/detection.js'

let main = new Screen(1000, 600)
main.setTitle('Circle vs Rectangle Collision Detection')
main.setDescription('Using Separating Axis Theorem with Support Points')

let ctx = main.getContext()

let camera = new Camera({
  position: new Vector(0, 0),
  c: ctx,
  zoom: 1.5,
})

let circle = new Circle(new Vector(-100, 0), 60, {
  fillStyle: 'red',
  strokeStyle: 'white',
  lineWidth: 2,
})

let rectangle = new Rectangle(new Vector(100, 0), 100, 100)

let infoBox = new InfoBox(ctx, new Vector(0, 0), {
  Zoom: 'q/e',
  'Toggle Free Look': 't',
  'Camera Controls': 'a/w/s/d',
  'Control the circle': 'Arrow Keys',
})

let moment = { left: false, right: false, up: false, down: false }
let speed = 100

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') moment.left = true
  if (e.key === 'ArrowRight') moment.right = true
  if (e.key === 'ArrowUp') moment.up = true
  if (e.key === 'ArrowDown') moment.down = true
})

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') moment.left = false
  if (e.key === 'ArrowRight') moment.right = false
  if (e.key === 'ArrowUp') moment.up = false
  if (e.key === 'ArrowDown') moment.down = false
})

function draw(ctx) {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, main.width, main.height)

  camera.Draw(() => {
    // add grid lines for reference
    ctx.strokeStyle = 'rgba(205, 205, 205, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i < main.width; i += 30) {
      ctx.beginPath()
      ctx.moveTo(i - camera.offSet.x, -camera.offSet.y)
      ctx.lineTo(i - camera.offSet.x, main.height)
      ctx.stroke()
    }
    for (let i = 0; i < main.height; i += 30) {
      ctx.beginPath()
      ctx.moveTo(-camera.offSet.x, i - camera.offSet.y)
      ctx.lineTo(main.width - camera.offSet.x, i - camera.offSet.y)
      ctx.stroke()
    }

    rectangle.Draw(ctx)
    circle.Draw(ctx)
  })

  infoBox.draw()
}

function update(dt) {
  let collisionInfo = DetectPolyVsCircle(rectangle, circle)
  let isColliding = collisionInfo[0].collide
  if (isColliding) {
    let mf = new Manifold()
    mf.depth = collisionInfo[0].depth
    mf.normal = collisionInfo[0].n
    mf.points.push(collisionInfo[0].sp)
    mf.show(camera, ctx)
  }
  if (isColliding) {
    infoBox.addInfo(
      'Collision Depth',
      DetectPolyVsCircle(rectangle, circle)[0].depth.toFixed(1)
    )
  } else {
    infoBox.removeInfo('Collision Depth')
  }

  if (moment.left) circle.Translate(new Vector(-speed * dt, 0))
  if (moment.right) circle.Translate(new Vector(speed * dt, 0))
  if (moment.up) circle.Translate(new Vector(0, -speed * dt))
  if (moment.down) circle.Translate(new Vector(0, speed * dt))

  camera.Follow()
}

function loop() {
  main._resize()
  ctx.clearRect(0, 0, main.width, main.height)
  draw(ctx)
  update(0.016)
  requestAnimationFrame(loop)
}

loop()
