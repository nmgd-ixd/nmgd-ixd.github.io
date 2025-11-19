const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Runner = Matter.Runner,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events; // 시뮬레이션 루프를 위한 Runner 모듈 추가



let isPlaying = true;

let FRUITS = ITEMS_ACA;

const scoreText = document.getElementById('score');
const gameoverLayer = document.getElementById('gameover');


let isMoving = false;

// 캔버스 크기
const cw = 712;
const ch = 1138;

// 가로 벽 두께
const ww = 52;

// 바닥 두께
const gh = 200;

// 데드라인(topLine) 위치
const deadline = 750;

const bgColor = "rgba(0, 0, 0, 0)";
const lineColor = "rgba(0, 0, 0, 0.3)";

let score = 0;

// 새로운 아이템 생성 위치
const nx = 630;
const ny = 60;

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

const ground = Bodies.rectangle(cw/2, ch-ww, cw, gh, {
  isStatic: true,
  render: { fillStyle: lineColor }
});

const topLine = Bodies.rectangle(cw/2, deadline, cw, 200, {
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





/*** 새로운 랜덤 아이템 추가 *******/
function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(nx, ny, fruit.radius, {
    index: index,
    name: "item",
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





/*** 마우스/터치 이벤트 처리 *******/
window.onmousedown = (event) => {
  if (!isPlaying) {
    location.reload(true);
    return;
  }

  if (disableAction) {
    return;
  }

  Body.setPosition(currentBody, {
    x: event.clientX,
    y: sy,
  });

  Render.world(render);
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


/* 테스트중 ******************************/
let ty = 2000;

/*** matter.js 충돌 이벤트 처리 *******/
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {

    if(collision.bodyA.name=="item" && collision.bodyB.name=="item") {
      //console.log('아이템끼리 충돌..');
      
      if(collision.bodyA.position.y <= collision.bodyB.position.y) {
        ty = collision.bodyA.position.y;
      } else {
        ty = collision.bodyB.position.y;
      }

      /*
      if(ty <= 1000) {
        console.log('gameover...');
      }
      */
    }
/* 테스트중 ******************************/


    // 같은 아이템과 충돌했을 때
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

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

      score += 1;
      scoreText.innerText = 'SCORE: ' + score;
    }

    if(!disableAction && collision.bodyA.position.y <= 1000) {
      //console.log(collision.bodyA.name);
    }
    
    // topLine을 넘어가면 게임 끝 (오류 있음)
    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
      isPlaying = false;
      disableAction = true;
      gameoverLayer.style.opacity = 0.8;
      
      // 10초 후에 재실행(페이지 리로드)
      setTimeout(() => {
        location.reload(true);
      }, 10000);
    }
  });
});

addFruit();
