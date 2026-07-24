const wallTexture = new Image();
wallTexture.src = "BACKWALL.png";
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

// ---------------- PLAYER ----------------
let player = {
  x: 3.5,
  y: 3.5,
  angle: 0,
  speed: 0.06,
  rotSpeed: 0.04
};

// ---------------- INPUT ----------------
const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

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
  const sin = Math.sin(player.angle);
  const cos = Math.cos(player.angle);

  // ROTATION
  if (keys["arrowleft"]) player.angle -= player.rotSpeed;
  if (keys["arrowright"]) player.angle += player.rotSpeed;

  // FORWARD / BACKWARD
  if (keys["w"]) {
    const nx = player.x + cos * player.speed;
    const ny = player.y + sin * player.speed;
    if (map[Math.floor(ny)][Math.floor(nx)] === 0) {
      player.x = nx; player.y = ny;
    }
  }
  if (keys["s"]) {
    const nx = player.x - cos * player.speed;
    const ny = player.y - sin * player.speed;
    if (map[Math.floor(ny)][Math.floor(nx)] === 0) {
      player.x = nx; player.y = ny;
    }
  }

  // STRAFE LEFT / RIGHT
  if (keys["a"]) {
    const nx = player.x + sin * player.speed;
    const ny = player.y - cos * player.speed;
    if (map[Math.floor(ny)][Math.floor(nx)] === 0) {
      player.x = nx; player.y = ny;
    }
  }
  if (keys["d"]) {
    const nx = player.x - sin * player.speed;
    const ny = player.y + cos * player.speed;
    if (map[Math.floor(ny)][Math.floor(nx)] === 0) {
      player.x = nx; player.y = ny;
    }
  }
}

// ---------------- FLOOR + CEILING ----------------
function renderFloorCeiling() {
  const halfH = H / 2;

  for (let y = 0; y < halfH; y++) {
    // Ceiling (light gray)
    ctx.fillStyle = `rgb(150,150,150)`;
    ctx.fillRect(0, y, W, 1);

    // Floor (dark yellow)
    ctx.fillStyle = `rgb(120,110,20)`;
    ctx.fillRect(0, H - y - 1, W, 1);
  }
}


// ---------------- RENDER WALLS ----------------
function renderWalls() {
  const fov = Math.PI / 3;
  const texSize = 64;

  for (let col = 0; col < W; col++) {
    const angle = player.angle + (col / W - 0.5) * fov;
    const hit = castRay(angle);

    const dist = hit.dist * Math.cos(angle - player.angle);
    const wallHeight = (H / dist);

    const texIndex = hit.tile - 1; 

    const hitX = player.x + Math.cos(angle) * hit.dist;
    const hitY = player.y + Math.sin(angle) * hit.dist;
    let texX;
    if (Math.abs(hitX - Math.floor(hitX)) > Math.abs(hitY - Math.floor(hitY))) {
      texX = hitX % 1;
    } else {
      texX = hitY % 1;
    }
    if (texX < 0) texX += 1;

    const sx = texIndex * texSize + Math.floor(texX * texSize);

    // Draw scaled texture column
    ctx.drawImage(
      wallTexture,
      sx, 0, 1, texSize,            // source column
      col, (H - wallHeight) / 2,    // destination
      1, wallHeight
    );
  }
}

// ---------------- LOOP ----------------
function loop() {
  update();

  renderFloorCeiling();
  renderWalls();

  requestAnimationFrame(loop);
}
loop();
