import Screen from '../../2PS/core/canvas/screen.js'
import Circle from '../../2PS/core/geometry/circle.js'
import Vector from '../../2PS/core/util/vector.js'
import Camera from '../../2PS/core/canvas/camera.js'
import InfoBox from '../../2PS/core/canvas/info.js'
import Manifold from '../../2PS/core/collision/manifold.js'
import Polygon from '../../2PS/core/geometry/polygon.js';
import { Detect } from '../../2PS/core/collision/detection.js'
import { Resolve } from '../../2PS/core/collision/resolution.js'

let main = new Screen(1000, 600)
main.setTitle('Collision Resolution Test')
main.setDescription('')

let ctx = main.getContext()

let camera = new Camera({
  position: new Vector(0, 0),
  c: ctx,
  zoom: 1.5,
})

let circle = new Circle(new Vector(-100, 0), 60, {
  fillStyle: 'red',
  strokeStyle: 'white',
  lineWidth: 1,
})
let circle2 = new Circle(new Vector(100, 0), 50, {
  fillStyle: 'blue',
  strokeStyle: 'white',
  lineWidth: 1,
})

let polygon = new Polygon(new Vector(200, 0), 3, 50)

let objects = [circle, circle2, polygon]

objects.push(new Polygon(new Vector(100, 100), 4, 100))

camera.SetTarget(circle)

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
  ctx.clearRect(0, 0, main.width, main.height)
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

    for(let i = 0; i < objects.length; i++) {
        objects[i].Draw(ctx);
    }
    
  })

  infoBox.draw()
}

function update(dt) {


  for(let i = 0; i < objects.length; i++) {
    for(let j = i + 1; j < objects.length; j++) {
        let collisionInfo = Detect(objects[i], objects[j])
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
            Detect(objects[i], objects[j])[0].depth.toFixed(1)
            )
        } else {
            infoBox.removeInfo('Collision Depth')
        }

        Resolve(objects[i], objects[j], collisionInfo[0])
    }
  }


  if (moment.left) circle.Translate(new Vector(-speed * dt, 0))
  if (moment.right) circle.Translate(new Vector(speed * dt, 0))
  if (moment.up) circle.Translate(new Vector(0, -speed * dt))
  if (moment.down) circle.Translate(new Vector(0, speed * dt))

  camera.Follow()
}

function loop() {
  main._resize()
  draw(ctx)
  update(0.016)
  requestAnimationFrame(loop)
}

loop()
