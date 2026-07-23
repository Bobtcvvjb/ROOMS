const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

// ---------------- MAP ----------------
const map = [
  [1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1],
  [1,0,2,0,0,0,0,1],
  [1,0,0,0,0,3,0,1],
  [1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1]
];

const TILE = 1; // each cell is 1 unit

// ---------------- PLAYER ----------------
let player = {
  x: 3.5,
  y: 3.5,
  angle: 0,
  speed: 0.05,
  rotSpeed: 0.03
};

// ---------------- INPUT ----------------
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ---------------- RAYCAST ----------------
function castRay(angle) {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);

  let dist = 0;
  while (dist < 20) {
    const rx = player.x + cos * dist;
    const ry = player.y + sin * dist;

    const mx = Math.floor(rx);
    const my = Math.floor(ry);

    if (map[my] && map[my][mx] > 0) {
      return { dist, tile: map[my][mx] };
    }
    dist += 0.01;
  }
  return { dist: 20, tile: 0 };
}

// ---------------- UPDATE ----------------
function update() {
  if (keys["ArrowLeft"]) player.angle -= player.rotSpeed;
  if (keys["ArrowRight"]) player.angle += player.rotSpeed;

  const sin = Math.sin(player.angle);
  const cos = Math.cos(player.angle);

  if (keys["ArrowUp"]) {
    const nx = player.x + cos * player.speed;
    const ny = player.y + sin * player.speed;
    if (map[Math.floor(ny)][Math.floor(nx)] === 0) {
      player.x = nx;
      player.y = ny;
    }
  }

  if (keys["ArrowDown"]) {
    const nx = player.x - cos * player.speed;
    const ny = player.y - sin * player.speed;
    if (map[Math.floor(ny)][Math.floor(nx)] === 0) {
      player.x = nx;
      player.y = ny;
    }
  }
}

// ---------------- RENDER ----------------
function render() {
  ctx.fillStyle = "#444";
  ctx.fillRect(0, 0, W, H);

  const fov = Math.PI / 3;
  for (let col = 0; col < W; col++) {
    const angle = player.angle + (col / W - 0.5) * fov;
    const hit = castRay(angle);

    const dist = hit.dist * Math.cos(angle - player.angle); // remove fisheye
    const wallHeight = (H / dist);

    const shade = 200 - hit.dist * 10;
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;

    ctx.fillRect(col, (H - wallHeight) / 2, 1, wallHeight);
  }
}

// ---------------- LOOP ----------------
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
loop();
