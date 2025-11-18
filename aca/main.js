import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS_BASE, ITEMS_ACA } from "./fruits";

let THEME = "aca"; // { base, aca }
let FRUITS = FRUITS_BASE;

const scoreText = document.getElementById('score');

// 캔버스 크기
const cw = 712;
const ch = 1138;

// 가로라인 두께
const ww = 30;

// 데드라인 위치. 맨 위가 0
const deadline = 1000;

const bgColor = "#F7F4C8";
const lineColor = "#E6B143";

let score = 0;

switch (THEME) {
  case "base":
    FRUITS = FRUITS_BASE;
    break;

  case "aca":
    FRUITS = ITEMS_ACA;
    break;
  
  default:
    FRUITS = ITEMS_ACA;
}

const engine = Engine.create();
const container = document.getElementById('main');

const render = Render.create({
  engine: engine,
  element: container,
  options: {
    wireframes: false,
    background: bgColor,
    width: cw,
    height: ch,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(ww/2, ch/2, ww, ch, {
  isStatic: true,
  render: { fillStyle: lineColor }
});

const rightWall = Bodies.rectangle(cw-ww/2, ch/2, ww, ch, {
  isStatic: true,
  render: { fillStyle: lineColor }
});

const ground = Bodies.rectangle(cw/2, ch-ww, cw, 60, {
  isStatic: true,
  render: { fillStyle: lineColor }
});

const topLine = Bodies.rectangle(cw/2, deadline, cw, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: lineColor }
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` }
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }

  switch (event.code) {
    case "KeyA":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > ww)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    case "KeyD":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < cw-ww)
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 1,
          y: currentBody.position.y,
        });
      }, 5);
      break;

    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
}

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
}

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      // 같은 아이템인 경우 score +1
      score += 1;
      scoreText.innerText = score;
      console.log(score);

      if (index === FRUITS.length - 1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png` }
          },
          index: index + 1,
        }
      );

      World.add(world, newBody);
    }

    // topLine을 넘어가면 게임 끝. 페이지 리로딩
    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
      alert("Game over");
      location.reload(true);
    }
  });
});

addFruit();
