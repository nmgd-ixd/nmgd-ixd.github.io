//import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
//import { FRUITS_BASE, ITEMS_ACA } from "./fruits";

const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Runner = Matter.Runner,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events; // 시뮬레이션 루프를 위한 Runner 모듈 추가


const ITEMS_ACA = [
  {
    name: "items/00_item",
    radius: 33 / 2,
  },
  {
    name: "items/01_item",
    radius: 43 / 2,
  },
  {
    name: "items/02_item",
    radius: 61 / 2,
  },
  {
    name: "items/03_item",
    radius: 76 / 2,
  },
  {
    name: "items/04_item",
    radius: 95 / 2,
  },
  {
    name: "items/05_item",
    radius: 117 / 2,
  },
  {
    name: "items/06_item",
    radius: 137 / 2,
  },
  {
    name: "items/07_item",
    radius: 161 / 2,
  },
  {
    name: "items/08_item",
    radius: 204 / 2,
  },
  {
    name: "items/09_item",
    radius: 220 / 2,
  },
  {
    name: "items/10_item",
    radius: 260 / 2,
  },
];


let FRUITS = ITEMS_ACA;

const scoreText = document.getElementById('score');


let isMoving = false;

// 캔버스 크기
const cw = 712;
const ch = 1138;

// 가로라인 두께
const ww = 30;

// 데드라인 위치. 맨 위가 0
const deadline = 200;

const bgColor = "#F7F4C8";
const lineColor = "#E6B143";

let score = 0;

// 새로운 아이템 생성 위치
const nx = 150;
const ny = 100;

// 클릭 후 아이템 생성 위치 y값
const sy = 300;


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



// Matter.js Mouse Constraint 추가

/*
// 캔버스에 마우스 입력 바인딩
const mouse = Mouse.create(render.canvas);

// MouseConstraint 생성
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        // 드래그 시 마우스와 바디 사이의 연결(constraint) 설정
        stiffness: 0.2, // 강성 (얼마나 뻣뻣하게 연결되는지)
        render: {
            visible: false // 연결선 숨기기
        }
    }
});

// MouseConstraint를 월드에 추가
World.add(world, mouseConstraint);

// 고해상도 디스플레이(예: 레티나)를 위한 픽셀 비율 설정 (선택 사항)
// mouse.pixelRatio = window.devicePixelRatio; 



/*** 마우스 드래그 이벤트 처리 *******/

// beforeUpdate 이벤트에 핸들러 등록
/*Events.on(engine, 'beforeUpdate', function() {
    // 마우스가 바디를 잡고 있을 때만 y 위치를 고정
    if (mouseConstraint.body === currentBody) {
        // 초기 y 위치 또는 고정하려는 특정 y 위치로 설정
        Matter.Body.setPosition(currentBody, { 
            x: currentBody.position.x, 
            y: 100 // 고정하려는 y 좌표
        });
    }
});


// 드래그 시작 이벤트
Matter.Events.on(mouseConstraint, 'startdrag', function(event) {
    console.log('드래그 시작:', event.body.x);
});

// 드래그 종료 이벤트
Matter.Events.on(mouseConstraint, 'enddrag', function(event) {
    console.log('드래그 종료:', event.body.id);

          currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
});
*/




/*** 새로운 랜덤 아이템 추가 *******/
function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(nx, ny, fruit.radius, {
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


/*
window.onmousemove = (event) => {
  if(isMoving) {
    Body.setPosition(currentBody, {
            x: event.clientX,
            y: 50,
          });
  }
}
*/

/*** 마우스/터치 이벤트 처리 *******/
window.onmousedown = (event) => {
  if (disableAction) {
    return;
  }

  Body.setPosition(currentBody, {
    x: event.clientX,
    y: sy,
  });

  Render.run();
}

window.onmouseup = (event) => {
  if (disableAction) {
    return;
  }

  currentBody.isSleeping = false;
  disableAction = true;

  setTimeout(() => {
    addFruit();
    disableAction = false;
  }, 1000);
}





/* 키보드 이벤트 처리 */
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
