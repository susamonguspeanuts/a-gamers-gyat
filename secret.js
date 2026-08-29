/* ================= SECRET GAME ================= */


const levels = [
  {name:"Warm Up", icon:"🌟", desc:"Simple jumps", bg:"normal", trolls:0, speed:1},
  {name:"Neon Road", icon:"💜", desc:"Faster obstacles", bg:"neon", trolls:0, speed:1.15},
  {name:"Tiny Troll", icon:"😈", desc:"One sneaky troll", bg:"purple", trolls:1, speed:1.2},
  {name:"Lava Panic", icon:"🌋", desc:"Don't touch the lava", bg:"lava", trolls:1, speed:1.3},
  {name:"Fake Finish", icon:"🏁", desc:"The finish lies", bg:"glitch", trolls:2, speed:1.35},
  {name:"Moon Jump", icon:"🌙", desc:"Floaty jumps", bg:"moon", trolls:1, speed:1.4},
  {name:"Troll City", icon:"👹", desc:"Lots of traps", bg:"red", trolls:3, speed:1.5},
  {name:"Speed Demon", icon:"⚡", desc:"VERY fast", bg:"speed", trolls:2, speed:1.7},
  {name:"Chaos Mode", icon:"🌀", desc:"Everything changes", bg:"chaos", trolls:3, speed:1.8},
  {name:"GYAT MASTER", icon:"👑", desc:"Final challenge", bg:"gold", trolls:4, speed:2}
];

let progress = Number(localStorage.getItem("gyatProgress") || 3);
let coins = Number(localStorage.getItem("gyatCoins") || 0);
let inventory = JSON.parse(localStorage.getItem("gyatInventory") || "{}");
let currentLevel = 0;
let runTimer = null;
let jumped = false;
let trollActive = false;

const secretGame = document.getElementById("secretGame");
const levelScreen = document.getElementById("levelScreen");
const gameScreen = document.getElementById("gameScreen");
const shopScreen = document.getElementById("shopScreen");
const levelsEl = document.getElementById("levels");
const coinText = document.getElementById("coinText");
const shopCoins = document.getElementById("shopCoins");
const playCoins = document.getElementById("playCoins");
const levelTitle = document.getElementById("levelTitle");
const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const goal = document.getElementById("goal");
const gameMessage = document.getElementById("gameMessage");
const levelHint = document.getElementById("levelHint");

function saveGame() {
  localStorage.setItem("gyatProgress", progress);
  localStorage.setItem("gyatCoins", coins);
  localStorage.setItem("gyatInventory", JSON.stringify(inventory));
}

function updateCoins() {
  coinText.textContent = coins;
  shopCoins.textContent = coins;
  playCoins.textContent = coins;
}

function renderLevels() {
  levelsEl.innerHTML = levels.map((level, i) => {
    const unlocked = i < progress;
    const stars = i < Math.max(0, progress - 1) ? "★★★" : "☆☆☆";
    return `
      <button class="level-card ${unlocked ? "" : "locked"}" data-level="${i}" ${unlocked ? "" : "disabled"}>
        <span class="level-number">${i+1}</span>
        <span class="level-icon">${unlocked ? level.icon : "🔒"}</span>
        <b>${level.name}</b>
        <small>${level.desc}</small>
        <span class="stars">${stars}</span>
      </button>`;
  }).join("");
  document.querySelectorAll(".level-card:not(.locked)").forEach(btn => {
    btn.addEventListener("click", () => startLevel(Number(btn.dataset.level)));
  });
  updateCoins();
}

function openSecretGame() {
  secretGame.classList.remove("hidden");
  renderLevels();
}

function startLevel(index) {
  currentLevel = index;
  const level = levels[index];
  levelScreen.classList.add("hidden");
  shopScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  levelTitle.textContent = `Level ${index + 1} — ${level.name}`;
  levelHint.textContent = level.desc + (level.trolls ? " Watch for trolls!" : " Reach the flag!");
  gameArea.className = `game-area theme-${level.bg}`;
  gameMessage.textContent = "GO! Jump with SPACE or the button!";
  player.className = "";
  player.style.left = "35px";
  goal.style.right = "25px";
  jumped = false;
  trollActive = false;

  const old = gameArea.querySelectorAll(".obstacle, .troll, .coin");
  old.forEach(x => x.remove());

  const obstacleCount = Math.min(5, 1 + Math.floor(index / 2));
  for (let i = 0; i < obstacleCount; i++) {
    const obstacle = document.createElement("div");
    obstacle.className = "obstacle";
    obstacle.textContent = i % 2 ? "🪨" : "🔥";
    obstacle.style.left = `${150 + i * 115 + (index % 2) * 25}px`;
    obstacle.style.animationDelay = `${i * .12}s`;
    gameArea.appendChild(obstacle);
  }

  for (let i = 0; i < Math.min(3, 1 + Math.floor(index / 3)); i++) {
    const c = document.createElement("div");
    c.className = "coin";
    c.textContent = "🪙";
    c.style.left = `${210 + i * 150}px`;
    c.style.top = `${35 + (i % 2) * 30}px`;
    gameArea.appendChild(c);
  }

  for (let i = 0; i < level.trolls; i++) {
    const troll = document.createElement("div");
    troll.className = "troll";
    troll.textContent = i % 2 ? "🤡" : "😈";
    troll.style.left = `${260 + i * 105}px`;
    troll.style.animationDelay = `${i * .3}s`;
    gameArea.appendChild(troll);
  }

  if (index === 4 || index === 8) {
    const fake = document.createElement("div");
    fake.className = "fake-finish";
    fake.textContent = "🏁 FAKE";
    fake.style.right = "120px";
    gameArea.appendChild(fake);
  }

  clearInterval(runTimer);
  runTimer = setInterval(() => {
    const p = parseInt(player.style.left || "35", 10);
    const next = p + Math.round(3 * level.speed + (inventory.speed ? 1 : 0));
    player.style.left = Math.min(next, gameArea.clientWidth - 65) + "px";
    checkCollisions();
  }, 40);
}

function jump() {
  if (jumped || gameScreen.classList.contains("hidden")) return;
  jumped = true;
  player.classList.add("jumping");
  setTimeout(() => {
    jumped = false;
    player.classList.remove("jumping");
  }, levels[currentLevel].bg === "moon" ? 850 : 600);
}

function checkCollisions() {
  const pRect = player.getBoundingClientRect();
  const gRect = gameArea.getBoundingClientRect();

  gameArea.querySelectorAll(".coin").forEach(c => {
    if (c.dataset.taken) return;
    const r = c.getBoundingClientRect();
    if (pRect.right > r.left && pRect.left < r.right && pRect.bottom > r.top && pRect.top < r.bottom) {
      c.dataset.taken = "1";
      c.style.opacity = "0";
      coins += inventory.magnet ? 2 : 1;
      saveGame(); updateCoins();
    }
  });

  if (pRect.right >= gRect.right - 55) {
    finishLevel();
    return;
  }

  gameArea.querySelectorAll(".obstacle, .troll").forEach(o => {
    const r = o.getBoundingClientRect();
    if (pRect.right > r.left + 8 && pRect.left < r.right - 8 && pRect.bottom > r.top + 8 && pRect.top < r.bottom - 8) {
      if (jumped) return;
      if (o.classList.contains("troll") && inventory.shield && !trollActive) {
        trollActive = true;
        gameMessage.textContent = "🛡️ SHIELD BLOCKED THE TROLL!";
        o.remove();
        return;
      }
      failLevel();
    }
  });
}

function finishLevel() {
  clearInterval(runTimer);
  const wasNew = currentLevel + 1 >= progress;
  coins += 5 + (inventory.magnet ? 2 : 0);
  if (currentLevel + 1 < levels.length && currentLevel + 1 >= progress) progress = currentLevel + 2;
  saveGame(); updateCoins(); renderLevels();
  gameMessage.textContent = currentLevel === 9 ? "👑 YOU BEAT THE GYAT MASTER!" : "🎉 LEVEL COMPLETE! +COINS";
  gameArea.classList.add("win-flash");
  setTimeout(() => {
    gameArea.classList.remove("win-flash");
    levelScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
  }, 1300);
}

function failLevel() {
  clearInterval(runTimer);
  gameMessage.textContent = "💀 BONK! Try again!";
  gameArea.classList.add("shake");
  setTimeout(() => {
    gameArea.classList.remove("shake");
    startLevel(currentLevel);
  }, 850);
}

document.getElementById("jumpButton").addEventListener("click", jump);
document.addEventListener("keydown", e => {
  if ((e.code === "Space" || e.code === "ArrowUp") && !gameScreen.classList.contains("hidden")) {
    e.preventDefault(); jump();
  }
});

document.getElementById("backLevels").addEventListener("click", () => {
  clearInterval(runTimer);
  gameScreen.classList.add("hidden");
  levelScreen.classList.remove("hidden");
  renderLevels();
});
document.getElementById("closeGame").addEventListener("click", () => {
  clearInterval(runTimer);
  secretGame.classList.add("hidden");
});
document.getElementById("shopButton").addEventListener("click", () => {
  levelScreen.classList.add("hidden");
  shopScreen.classList.remove("hidden");
  updateCoins();
});
document.getElementById("closeShop").addEventListener("click", () => {
  shopScreen.classList.add("hidden");
  levelScreen.classList.remove("hidden");
  renderLevels();
});

document.querySelectorAll(".shop-item").forEach(item => {
  item.addEventListener("click", () => {
    const key = item.dataset.item;
    const cost = Number(item.dataset.cost);
    if (inventory[key]) {
      gameMessage.textContent = "Already owned!";
      return;
    }
    if (coins < cost) {
      alert(`You need ${cost - coins} more coins!`);
      return;
    }
    coins -= cost;
    inventory[key] = true;
    saveGame();
    updateCoins();
    item.classList.add("owned");
    item.querySelector("strong").textContent = "OWNED ✓";
  });
});

render();
