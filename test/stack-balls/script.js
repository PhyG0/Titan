import Screen from '../../2PS/core/canvas/screen.js'
import Circle from '../../2PS/core/geometry/circle.js'
import Vector from '../../2PS/core/util/vector.js'
import Camera from '../../2PS/core/canvas/camera.js'
import InfoBox from '../../2PS/core/canvas/info.js'
import Rectangle from '../../2PS/core/geometry/rectangle.js'
import { random } from '../../2PS/core/util/math.js'
import { Detect } from '../../2PS/core/collision/detection.js'
import { LinearResolve, PositionalCorrection } from '../../2PS/core/collision/resolution.js'

let main = new Screen(1000, 600)
main.setTitle('Stack of Balls - Linear Impulse')
main.setDescription('')

let ctx = main.getContext()

let camera = new Camera({
  position: new Vector(0, 0),
  c: ctx,
  zoom: 1,
})


let objects = []

for(let i = 0; i < 50; i++) {
    let circle = new Circle(new Vector(random(-300, 300), random(-300, 200)), 40, {
        strokeStyle: 'white',
        lineWidth: 2
    })
    objects.push(circle);
}


let leftWall = new Rectangle(new Vector(-camera.offSet.x, -camera.offSet.y / 2 + 150), 30, 2 * camera.offSet.y)
leftWall.mass = 0;
leftWall.isStatic = true;
objects.push(leftWall);

let bottomWall = new Rectangle(new Vector(0, camera.offSet.y), 2 * camera.offSet.x, 30);
bottomWall.mass = 0;
bottomWall.isStatic = true;
objects.push(bottomWall)

let rightWall = new Rectangle(new Vector(camera.offSet.x, -camera.offSet.y / 2 + 150), 30, 2 * camera.offSet.y)
rightWall.mass = 0;
rightWall.isStatic = true;
objects.push(rightWall);

let infoBox = new InfoBox(ctx, new Vector(0, 0), {
  Zoom: 'q/e',
  'Toggle Free Look': 't',
  'Camera Controls': 'a/w/s/d',
  'Control the circle': 'Arrow Keys',
})

let moment = { left: false, right: false, up: false, down: false }
let speed = 3000

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

let gravity = new Vector(0, 500);

function update(dt) {

  for(let i = 0; i < objects.length; i++) {
    objects[i].AddForce(gravity);
    objects[i]._MomentIntegration(dt);

  }

  for(let i = 0; i < 3; i++) {
    for(let i = 0; i < objects.length; i++) {
        for(let j = i + 1; j < objects.length; j++) {
            let info = Detect(objects[i], objects[j])[0];
            if(info.collide) {
                PositionalCorrection(objects[i], objects[j], info);
                LinearResolve(objects[i], objects[j], info);
            }
        }
    }
  }

  if (moment.left) circle.AddForce(new Vector(-speed * dt, 0))
  if (moment.right) circle.AddForce(new Vector(speed * dt, 0))
  if (moment.up) circle.AddForce(new Vector(0, -speed * dt))
  if (moment.down) circle.AddForce(new Vector(0, speed * dt))

  camera.Follow()
}

function loop() {
  main._resize()
  draw(ctx)
  update(0.016)
  requestAnimationFrame(loop)
}

loop()
