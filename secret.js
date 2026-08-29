/* ================= SECRET GAME ================= */

const levels = [
  {name:"Warm Up", icon:"🌟", desc:"Learn the run", bg:"normal", trolls:0, speed:1, distance:2600, obstacles:7},
  {name:"Neon Road", icon:"💜", desc:"Faster obstacles", bg:"neon", trolls:0, speed:1.12, distance:3000, obstacles:9},
  {name:"Tiny Troll", icon:"😈", desc:"Something is hiding...", bg:"purple", trolls:2, speed:1.18, distance:3300, obstacles:10},
  {name:"Lava Panic", icon:"🌋", desc:"Keep moving", bg:"lava", trolls:2, speed:1.25, distance:3600, obstacles:12},
  {name:"Fake Finish", icon:"🏁", desc:"Can you spot the real one?", bg:"glitch", trolls:3, speed:1.3, distance:3900, obstacles:13},
  {name:"Moon Jump", icon:"🌙", desc:"Strange gravity", bg:"moon", trolls:2, speed:1.36, distance:4200, obstacles:14},
  {name:"Troll City", icon:"👹", desc:"Trust nothing", bg:"red", trolls:5, speed:1.45, distance:4500, obstacles:16},
  {name:"Speed Demon", icon:"⚡", desc:"No time to think", bg:"speed", trolls:4, speed:1.62, distance:4800, obstacles:17},
  {name:"Chaos Mode", icon:"🌀", desc:"Everything is unpredictable", bg:"chaos", trolls:6, speed:1.75, distance:5100, obstacles:19},
  {name:"GYAT MASTER", icon:"👑", desc:"The final test", bg:"gold", trolls:7, speed:1.9, distance:5500, obstacles:22}
];

let progress = Number(localStorage.getItem("gyatProgress") || 3);
let coins = Number(localStorage.getItem("gyatCoins") || 0);
let inventory = JSON.parse(localStorage.getItem("gyatInventory") || "{}");
let currentLevel = 0;
let runTimer = null;
let jumpTimer = null;
let jumped = false;
let playerX = 35;
let distanceTravelled = 0;
let obstacleData = [];

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
  secretGame.scrollIntoView({behavior:"smooth", block:"start"});
}

function makeObstacle(emoji, x, type="normal") {
  const el = document.createElement("div");
  el.className = "obstacle";
  el.textContent = emoji;
  el.style.left = x + "px";
  if (type === "wide") el.classList.add("wide-obstacle");
  gameArea.appendChild(el);
  obstacleData.push({el, x, type});
}

function makeTroll(x) {
  // Deliberately looks like an ordinary harmless object until the player hits it.
  const el = document.createElement("div");
  el.className = "troll hidden-troll";
  el.textContent = ["🪨","📦","🌳","🪵"][Math.floor(Math.random()*4)];
  el.style.left = x + "px";
  gameArea.appendChild(el);
  obstacleData.push({el, x, type:"troll"});
}

function makeCoin(x, y) {
  const c = document.createElement("div");
  c.className = "coin";
  c.textContent = "🪙";
  c.style.left = x + "px";
  c.style.top = y + "px";
  gameArea.appendChild(c);
}

function startLevel(index) {
  currentLevel = index;
  const level = levels[index];
  levelScreen.classList.add("hidden");
  shopScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  levelTitle.textContent = `Level ${index + 1} — ${level.name}`;
  levelHint.textContent = level.desc;
  gameArea.className = `game-area theme-${level.bg}`;
  gameMessage.textContent = "GO!";
  player.className = "";
  playerX = 35;
  distanceTravelled = 0;
  player.style.left = playerX + "px";
  player.style.bottom = "28px";
  goal.style.display = "none";
  jumped = false;
  obstacleData = [];

  gameArea.querySelectorAll(".obstacle,.troll,.coin,.fake-finish,.real-finish").forEach(x => x.remove());

  // The actual course is much longer than the visible game window.
  // Objects move toward the player as the player advances through the course.
  let spacing = Math.max(175, Math.floor(level.distance / (level.obstacles + level.trolls + 1)));
  let positions = [];
  for (let i=0; i<level.obstacles + level.trolls; i++) {
    positions.push(380 + i * spacing + Math.floor(Math.random()*75));
  }

  let trollIndexes = new Set();
  while (trollIndexes.size < level.trolls) {
    trollIndexes.add(Math.floor(Math.random() * positions.length));
  }

  // Every level gets a different obstacle mechanic.
  const q = level.quirk;

  if (q === "blocks") {
    positions.forEach((x, i) => makeObstacle(i % 2 ? "🧱" : "🪨", x, i % 4 === 0 ? "wide" : "normal"));
  }

  if (q === "moving") {
    positions.forEach((x, i) => {
      const el = document.createElement("div");
      el.className = "moving-obstacle";
      el.textContent = i % 2 ? "🧱" : "🔷";
      el.style.left = x + "px";
      el.style.bottom = (35 + (i % 3) * 28) + "px";
      gameArea.appendChild(el);
      obstacleData.push({el, x, type:"moving", phase:i});
    });
  }

  if (q === "cointrap") {
    positions.forEach((x, i) => {
      // Visually identical coins. The trap is only revealed after collection.
      const c = document.createElement("div");
      c.className = "coin troll-coin";
      c.textContent = "🪙";
      c.style.left = x + "px";
      c.style.top = (40 + (i % 3) * 32) + "px";
      c.dataset.worldX = String(x);
      c.dataset.trollCoin = (i % 3 === 1 || i === positions.length - 1) ? "1" : "0";
      gameArea.appendChild(c);
    });
  }

  if (q === "lava") {
    positions.forEach((x, i) => {
      const el = document.createElement("div");
      el.className = "lava-geyser";
      el.textContent = i % 2 ? "🔥" : "🌋";
      el.style.left = x + "px";
      el.style.bottom = "28px";
      gameArea.appendChild(el);
      obstacleData.push({el, x, type:"geyser", phase:i});
    });
  }

  if (q === "fakefinish") {
    // Long normal section first; fake finish markers are added below.
    positions.forEach((x, i) => makeObstacle(i % 2 ? "⚠️" : "🧱", x, "normal"));
  }

  if (q === "floaters") {
    positions.forEach((x, i) => {
      const el = document.createElement("div");
      el.className = "floating-obstacle";
      el.textContent = ["☄️","🪨","🛸"][i % 3];
      el.style.left = x + "px";
      el.style.bottom = (75 + (i % 3) * 42) + "px";
      gameArea.appendChild(el);
      obstacleData.push({el, x, type:"floater", phase:i});
    });
  }

  if (q === "lasers") {
    positions.forEach((x, i) => {
      const el = document.createElement("div");
      el.className = "laser";
      el.textContent = "⚡";
      el.style.left = x + "px";
      el.style.bottom = i % 2 ? "100px" : "34px";
      el.style.width = (70 + (i % 3) * 20) + "px";
      gameArea.appendChild(el);
      obstacleData.push({el, x, type:"laser", phase:i});
    });
  }

  if (q === "crusher") {
    positions.forEach((x, i) => {
      const el = document.createElement("div");
      el.className = "crusher";
      el.textContent = "⬇️";
      el.style.left = x + "px";
      el.style.bottom = "115px";
      gameArea.appendChild(el);
      obstacleData.push({el, x, type:"crusher", phase:i});
    });
  }

  if (q === "blink") {
    positions.forEach((x, i) => {
      const el = document.createElement("div");
      el.className = "blink-obstacle";
      el.textContent = i % 2 ? "❌" : "💠";
      el.style.left = x + "px";
      el.style.bottom = (28 + (i % 3) * 30) + "px";
      gameArea.appendChild(el);
      obstacleData.push({el, x, type:"blink", phase:i});
    });
  }

  if (q === "combo") {
    positions.forEach((x, i) => {
      if (i % 4 === 0) {
        const el = document.createElement("div");
        el.className = "laser";
        el.textContent = "⚡";
        el.style.left = x + "px";
        el.style.bottom = "90px";
        gameArea.appendChild(el);
        obstacleData.push({el, x, type:"laser", phase:i});
      } else if (i % 4 === 1) {
        const el = document.createElement("div");
        el.className = "floating-obstacle";
        el.textContent = "☄️";
        el.style.left = x + "px";
        el.style.bottom = "80px";
        gameArea.appendChild(el);
        obstacleData.push({el, x, type:"floater", phase:i});
      } else if (i % 4 === 2) {
        makeObstacle("🧱", x, "wide");
      } else {
        const c = document.createElement("div");
        c.className = "coin troll-coin";
        c.textContent = "🪙";
        c.style.left = x + "px";
        c.style.top = "55px";
        c.dataset.worldX = String(x);
        c.dataset.trollCoin = "1";
        gameArea.appendChild(c);
      }
    });
  }

  // Fake finishes are intentionally convincing.
  if (q === "fakefinish") {
    [0.38, 0.62].forEach((ratio, i) => {
      const f = document.createElement("div");
      f.className = "fake-finish";
      f.textContent = "🏁";
      f.style.left = (level.distance * ratio + 380 - distanceTravelled) + "px";
      gameArea.appendChild(f);
      obstacleData.push({el:f, x:level.distance * ratio + 380, type:"fake", phase:i});
    });
  }

  // Real finish is not displayed until the end.
  runTimer = setInterval(updateRun, 30);
}

function updateRun() {
  const level = levels[currentLevel];
  const step = 3.2 * level.speed + (inventory.speed ? 0.8 : 0);
  distanceTravelled += step;

  // Keep the player grounded or in one controlled jump.
  playerX = 35;
  player.style.left = "35px";

  obstacleData.forEach(o => {
    const relative = o.x - distanceTravelled;
    o.el.style.left = relative + "px";
  });

  gameArea.querySelectorAll(".coin").forEach(c => {
    const originalX = parseInt(c.dataset.worldX || "0");
    if (!originalX) {
      const screenX = parseInt(c.style.left);
      c.dataset.worldX = String(screenX + distanceTravelled);
    }
    const x = Number(c.dataset.worldX) - distanceTravelled;
    c.style.left = x + "px";
    const pRect = player.getBoundingClientRect(), r = c.getBoundingClientRect();
    if (!c.dataset.taken && pRect.right > r.left && pRect.left < r.right && pRect.bottom > r.top && pRect.top < r.bottom) {
      c.dataset.taken = "1"; c.style.opacity = "0";
      coins += inventory.magnet ? 2 : 1; saveGame(); updateCoins();
    }
  });

  checkCollisions();

  if (distanceTravelled >= level.distance) finishLevel();
}

function checkCollisions() {
  const pRect = player.getBoundingClientRect();

  obstacleData.forEach(o => {
    if (o.el.dataset.hit) return;
    const r = o.el.getBoundingClientRect();

    if (pRect.right > r.left + 7 && pRect.left < r.right - 7 &&
        pRect.bottom > r.top + 7 && pRect.top < r.bottom - 7) {
      o.el.dataset.hit = "1";

      if (o.type === "troll") {
        if (inventory.shield) {
          inventory.shield = false;
          saveGame();
          o.el.textContent = "💥";
          gameMessage.textContent = "BOOM!";
          setTimeout(() => o.el.remove(), 250);
          return;
        }
        failLevel();
        return;
      }

      if (o.type === "fake") {
        clearInterval(runTimer);
        runTimer = null;
        gameMessage.textContent = "🏁 YOU MADE IT!";
        gameArea.classList.add("fake-pause");
        setTimeout(() => {
          gameArea.classList.remove("fake-pause");
          gameMessage.textContent = "😈 ...NOPE.";
          setTimeout(() => startLevel(currentLevel), 500);
        }, 1100);
        return;
      }

      // Regular obstacles can only be cleared with a jump.
      if (!jumped) failLevel();
    }
  });
}

function jump() {
  if (jumped || gameScreen.classList.contains("hidden")) return;
  jumped = true;
  player.classList.add("jumping");
  clearTimeout(jumpTimer);
  jumpTimer = setTimeout(() => {
    jumped = false;
    player.classList.remove("jumping");
  }, levels[currentLevel].bg === "moon" ? 700 : 520);
}

function finishLevel() {
  clearInterval(runTimer);
  runTimer = null;
  coins += 5 + (inventory.magnet ? 2 : 0);
  if (currentLevel + 1 < levels.length && currentLevel + 1 >= progress) progress = currentLevel + 2;
  saveGame(); updateCoins(); renderLevels();
  gameMessage.textContent = currentLevel === 9 ? "👑 GYAT MASTER DEFEATED!" : "🎉 LEVEL COMPLETE! +COINS";
  goal.style.display = "block";
  gameArea.classList.add("win-flash");
  setTimeout(() => {
    gameArea.classList.remove("win-flash");
    levelScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
  }, 1300);
}

function failLevel() {
  if (!runTimer) return;
  clearInterval(runTimer);
  runTimer = null;
  gameMessage.textContent = "💀 GOT TROLLED!";
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
  clearInterval(runTimer); runTimer = null;
  gameScreen.classList.add("hidden"); levelScreen.classList.remove("hidden"); renderLevels();
});
document.getElementById("closeGame").addEventListener("click", () => {
  clearInterval(runTimer); runTimer = null; secretGame.classList.add("hidden");
});
document.getElementById("shopButton").addEventListener("click", () => {
  levelScreen.classList.add("hidden"); shopScreen.classList.remove("hidden"); updateCoins();
});
document.getElementById("closeShop").addEventListener("click", () => {
  shopScreen.classList.add("hidden"); levelScreen.classList.remove("hidden"); renderLevels();
});

document.querySelectorAll(".shop-item").forEach(item => {
  item.addEventListener("click", () => {
    const key = item.dataset.item, cost = Number(item.dataset.cost);
    if (inventory[key]) return;
    if (coins < cost) { alert(`You need ${cost - coins} more coins!`); return; }
    coins -= cost; inventory[key] = true; saveGame(); updateCoins();
    item.classList.add("owned");
    item.querySelector("strong").textContent = "OWNED ✓";
  });
});

renderLevels();
