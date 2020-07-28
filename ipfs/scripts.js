const DIAMETER = 50;
const RADIUS = DIAMETER / 2;
const OVERLAP = RADIUS / 2;
const ballCont = document.getElementById('balls');
let hue = Math.floor(Math.random() * 359);
let nextColor = `hsl(${hue}, 45%, 45%)`;
let balls = [];
let ballId = 0;

// update the colors via hue
function rotateColors () {
  hue = (hue + 1) % 360;
  nextColor = `hsl(${hue}, 45%, 45%)`;
  style.innerHTML = `a { background: ${nextColor}; color: hsl(${hue}, 35%, 95%) !important; border-color: hsl(${hue}, 35%, 95%) }`;
}

// create a single ball
function addBall (x = Math.floor(Math.random() * window.innerWidth / 2), y = Math.floor(Math.random() * window.innerHeight / 2), dx = 5, dy = 5, parentId = null) {
  const id = `ball${ballId++}`;
  const div = document.createElement('div');

  div.className = 'ball';
  div.setAttribute('id', id);
  div.style.background = nextColor;
  div.style.left = x;
  div.style.top = y;
  ballCont.appendChild(div);

  dx = ((dx > 0) ? 1 : -1) * ((Math.random() * 5) + 2);
  dy = ((dy > 0) ? 1 : -1) * ((Math.random() * 5) + 2);

  balls.push({ id, div, x, y, dx, dy, parentId });
}

// bounce a ball around the screen
function bounceBall (ball) {
  let splitAt = 0;

  // move it
  ball.x += ball.dx;
  ball.y += ball.dy;

  // bottom/top
  if ((ball.y + DIAMETER) >= window.innerHeight) {
    ball.y = window.innerHeight - DIAMETER - 1;
    splitAt = 1;
  } else if (ball.y <= 0) {
    ball.y = 1;
    splitAt = 1;
  }

  // right/left
  if ((ball.x + DIAMETER) >= window.innerWidth) {
    ball.x = window.innerWidth - DIAMETER - 1;
    splitAt = 2;
  } else if (ball.x <= 0) {
    ball.x = 1;
    splitAt = 2;
  }

  // edge detected, split in two
  if (splitAt) {
    if (splitAt === 1) {
      ball.dy = -ball.dy;
    } else {
      ball.dx = -ball.dx;
    }

    addBall(ball.x, ball.y, ball.dx, ball.dy, ball.id);
  }
}

// merge balls that are overlapping, but don't not split
function mergeBall (ball, index) {
  const overlap = balls.find((other) =>
    other && other !== ball &&
    ball.id !== other.parentId && ball.parentId !== other.id &&
    ((
      (ball.x + OVERLAP) >= other.x && (ball.x + OVERLAP) <= (other.x + DIAMETER) &&
      (ball.y + OVERLAP) >= other.y && (ball.y + OVERLAP) <= (other.y + DIAMETER)
    ) || (
      (other.x + OVERLAP) >= ball.x && (other.x + OVERLAP) <= (ball.x + DIAMETER) &&
      (other.y + OVERLAP) >= ball.y && (other.y + OVERLAP) <= (ball.y + DIAMETER)
    ))
  );

  // combine into the overlap
  if (overlap) {
    ball.div.parentNode.removeChild(ball.div);
    balls[index] = null;
  }
}

// Bounce the ball around the screen
function animateBalls () {
  // combine balls
  balls.forEach(mergeBall);

  // filter out the dead wood
  balls = balls.filter((ball) => ball);

  // bounce balls
  balls.forEach(bounceBall);

  // adjust on-screen position
  balls.forEach(({ div, x, y }) => {
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
  });

  window.requestAnimationFrame(animateBalls);
}

const style = document.createElement('style');

document.head.appendChild(style);

// initial setup
rotateColors(style);
addBall();

// on timers
window.requestAnimationFrame(animateBalls);
setInterval(() => rotateColors(style), 75);
