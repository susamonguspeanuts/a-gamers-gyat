
```javascript
/* =========================================================
   GYAT RUNNER
   10 LEVELS • SHOP • UPGRADES • TROLLS • SAVING
   ========================================================= */

(function(){

"use strict";


/* =========================================================
   LEVELS
   ========================================================= */

const levels = [

  {
    name:"GYAT CITY",
    icon:"🏙️",
    description:"Your first run.",
    target:500,
    speed:6,
    spawn:105,
    theme:"city"
  },

  {
    name:"NEON HIGHWAY",
    icon:"🌃",
    description:"Everything is faster.",
    target:800,
    speed:7,
    spawn:95,
    theme:"neon"
  },

  {
    name:"MEME DESERT",
    icon:"🏜️",
    description:"Beware the sandstorm.",
    target:1100,
    speed:8,
    spawn:88,
    theme:"desert"
  },

  {
    name:"SPACE GYAT",
    icon:"🚀",
    description:"Low gravity activated.",
    target:1400,
    speed:8.5,
    spawn:83,
    theme:"space"
  },

  {
    name:"LAVA ZONE",
    icon:"🌋",
    description:"The floor is getting hot.",
    target:1700,
    speed:9,
    spawn:78,
    theme:"lava"
  },

  {
    name:"CYBER CITY",
    icon:"🤖",
    description:"Watch for lasers.",
    target:2000,
    speed:9.5,
    spawn:73,
    theme:"cyber"
  },

  {
    name:"SKY TEMPLE",
    icon:"☁️",
    description:"The sky is dangerous.",
    target:2400,
    speed:10,
    spawn:69,
    theme:"sky"
  },

  {
    name:"GLITCH WORLD",
    icon:"👾",
    description:"Reality is broken.",
    target:2800,
    speed:10.5,
    spawn:65,
    theme:"glitch"
  },

  {
    name:"THE VOID",
    icon:"🌀",
    description:"Can you survive the darkness?",
    target:3300,
    speed:11,
    spawn:61,
    theme:"void"
  },

  {
    name:"GYAT KINGDOM",
    icon:"👑",
    description:"The final challenge.",
    target:4000,
    speed:12,
    spawn:57,
    theme:"kingdom"
  }

];


/* =========================================================
   SHOP ITEMS
   ========================================================= */

const shopItems = [

  {
    id:"speed",
    icon:"👟",
    name:"Speed Shoes",
    description:"Move faster through every level.",
    cost:100,
    currency:"coins",
    max:3
  },

  {
    id:"double",
    icon:"🪽",
    name:"Double Jump",
    description:"Jump twice before touching the ground.",
    cost:250,
    currency:"coins",
    max:1
  },

  {
    id:"shield",
    icon:"🛡️",
    name:"Shield",
    description:"Start every level with a protective shield.",
    cost:300,
    currency:"coins",
    max:3
  },

  {
    id:"magnet",
    icon:"🧲",
    name:"Coin Magnet",
    description:"Automatically collect nearby coins.",
    cost:400,
    currency:"coins",
    max:1
  },

  {
    id:"life",
    icon:"❤️",
    name:"Extra Life",
    description:"Start levels with one additional life.",
    cost:500,
    currency:"coins",
    max:2
  },

  {
    id:"jump",
    icon:"⚡",
    name:"Mega Jump",
    description:"Jump higher.",
    cost:600,
    currency:"coins",
    max:2
  },

  {
    id:"gem",
    icon:"💎",
    name:"Gem Multiplier",
    description:"Earn extra gems.",
    cost:750,
    currency:"gems",
    max:2
  },

  {
    id:"crown",
    icon:"👑",
    name:"Gyat Crown",
    description:"A legendary cosmetic.",
    cost:1000,
    currency:"gems",
    max:1
  }

];


/* =========================================================
   SAVED DATA
   ========================================================= */

let save = JSON.parse(
  localStorage.getItem("gyatRunnerSave") || "null"
);

if(!save){

  save = {

    coins:0,

    gems:0,

    unlocked:3,

    stars:Array(10).fill(0),

    purchases:{},

    skin:"😎"

  };

}

save.unlocked =
  Math.max(3,Math.min(10,save.unlocked || 3));

save.stars =
  Array.isArray(save.stars)
  ? save.stars
  : Array(10).fill(0);

save.purchases =
  save.purchases || {};

function saveGame(){

  localStorage.setItem(
    "gyatRunnerSave",
    JSON.stringify(save)
  );

}


/* =========================================================
   ELEMENTS
   ========================================================= */

const game =
  document.getElementById("gyatGame");

const levelsScreen =
  document.getElementById("gyatLevels");

const shop =
  document.getElementById("gyatShop");

const world =
  document.getElementById("gyatWorld");

const levelCards =
  document.getElementById("levelCards");

const shopItemsEl =
  document.getElementById("shopItems");

const player =
  document.getElementById("gyatPlayer");

const effects =
  document.getElementById("gyatEffects");

const ground =
  document.getElementById("gyatGround");

const start =
  document.getElementById("gyatStart");

const over =
  document.getElementById("gyatOver");

const complete =
  document.getElementById("gyatComplete");


/* =========================================================
   GAME STATE
   ========================================================= */

let currentLevel = 0;

let running = false;

let score = 0;

let levelCoins = 0;

let levelGems = 0;

let lives = 3;

let shield = 0;

let speed = 6;

let frame = 0;

let playerBottom = 85;

let velocityY = 0;

let jumpsLeft = 1;

let obstacles = [];

let coins = [];

let gems = [];

let lasers = [];

let lastTroll = 0;

const gravity = .8;


/* =========================================================
   OPEN
   ========================================================= */

function open(){

  game.style.display = "block";

  showLevels();

}

window.GyatRunner = {

  open:open

};


/* =========================================================
   LEVEL MENU
   ========================================================= */

function showLevels(){

  running = false;

  clearObjects();

  levelsScreen.style.display = "block";

  shop.style.display = "none";

  world.style.display = "none";

  renderLevels();

  updateMoney();

}


/* =========================================================
   RENDER LEVELS
   ========================================================= */

function renderLevels(){

  levelCards.innerHTML = "";

  levels.forEach(
    (level,index)=>{

      const card =
        document.createElement("div");

      const unlocked =
        index < save.unlocked;

      card.className =
        "gyat-level-card" +
        (unlocked ? "" : " locked");

      let stars = "";

      for(let i=0;i<3;i++){

        stars +=
          i < (save.stars[index] || 0)
          ? "⭐"
          : "☆";

      }

      card.innerHTML = `

        ${
          unlocked
          ? ""
          : '<div class="gyat-lock">🔒</div>'
        }

        <div class="gyat-level-number">
          LEVEL ${index+1}
        </div>

        <div class="gyat-level-icon">
          ${level.icon}
        </div>

        <h3>
          ${level.name}
        </h3>

        <p>
          ${level.description}
        </p>

        <div class="gyat-card-stars">
          ${stars}
        </div>

      `;

      if(unlocked){

        card.addEventListener(
          "click",
          ()=>openLevel(index)
        );

      }

      levelCards.appendChild(card);

    }
  );

}


/* =========================================================
   SHOP
   ========================================================= */

function openShop(){

  levelsScreen.style.display =
    "none";

  shop.style.display =
    "block";

  world.style.display =
    "none";

  renderShop();

  updateMoney();

}


function renderShop(){

  shopItemsEl.innerHTML = "";

  shopItems.forEach(
    item=>{

      const owned =
        save.purchases[item.id] || 0;

      const maxed =
        owned >= item.max;

      const currency =
        item.currency === "coins"
        ? "💰"
        : "💎";

      const balance =
        item.currency === "coins"
        ? save.coins
        : save.gems;

      const affordable =
        balance >= item.cost;

      const div =
        document.createElement("div");

      div.className =
        "shop-item";

      div.innerHTML = `

        <div class="shop-item-icon">
          ${item.icon}
        </div>

        <h3>
          ${item.name}
        </h3>

        <p>
          ${item.description}
        </p>

        <div class="shop-price">
          ${currency} ${item.cost}
          ${item.max > 1
            ? ` • ${owned}/${item.max}`
            : ""
          }
        </div>

        <button
          class="shop-buy"
          ${maxed || !affordable ? "disabled" : ""}
        >
          ${
            maxed
            ? "MAXED ✓"
            : "BUY"
          }
        </button>

      `;

      const button =
        div.querySelector("button");

      button.addEventListener(
        "click",
        ()=>buyItem(item)
      );

      shopItemsEl.appendChild(div);

    }
  );

}


function buyItem(item){

  const owned =
    save.purchases[item.id] || 0;

  if(owned >= item.max)
    return;

  if(item.currency === "coins"){

    if(save.coins < item.cost)
      return;

    save.coins -=
      item.cost;

  }
  else{

    if(save.gems < item.cost)
      return;

    save.gems -=
      item.cost;

  }

  save.purchases[item.id] =
    owned + 1;

  saveGame();

  renderShop();

  updateMoney();

}


/* =========================================================
   MONEY
   ========================================================= */

function updateMoney(){

  document.getElementById(
    "menuCoins"
  ).textContent =
    save.coins;

  document.getElementById(
    "menuGems"
  ).textContent =
    save.gems;

  document.getElementById(
    "shopCoins"
  ).textContent =
    save.coins;

  document.getElementById(
    "shopGems"
  ).textContent =
    save.gems;

}


/* =========================================================
   PURCHASE LEVEL BONUSES
   ========================================================= */

function owned(id){

  return save.purchases[id] || 0;

}


/* =========================================================
   OPEN LEVEL
   ========================================================= */

function openLevel(index){

  currentLevel = index;

  levelsScreen.style.display =
    "none";

  shop.style.display =
    "none";

  world.style.display =
    "block";

  start.style.display =
    "flex";

  over.style.display =
    "none";

  complete.style.display =
    "none";

  document.getElementById(
    "startNumber"
  ).textContent =
    index + 1;

  document.getElementById(
    "startName"
  ).textContent =
    levels[index].name;

  document.getElementById(
    "startDescription"
  ).textContent =
    levels[index].description;

  document.getElementById(
    "startObjective"
  ).textContent =
    "Reach " +
    levels[index].target +
    " score!";

  applyTheme();

}


/* =========================================================
   START LEVEL
   ========================================================= */

function startLevel(){

  running = true;

  start.style.display =
    "none";

  over.style.display =
    "none";

  complete.style.display =
    "none";

  score = 0;

  levelCoins = 0;

  levelGems = 0;

  frame = 0;

  lives =
    3 + owned("life");

  shield =
    owned("shield");

  speed =
    levels[currentLevel].speed +
    owned("speed") * .45;

  playerBottom = 85;

  velocityY = 0;

  jumpsLeft =
    owned("double") ? 2 : 1;

  clearObjects();

  player.style.bottom =
    playerBottom + "px";

  updateHUD();

  requestAnimationFrame(
    loop
  );

}


/* =========================================================
   THEME
   ========================================================= */

function applyTheme(){

  const theme =
    levels[currentLevel].theme;

  const themes = {

    city:[
      "#30306a",
      "#101027",
      "#06060d"
    ],

    neon:[
      "#31185b",
      "#091c38",
      "#05050d"
    ],

    desert:[
      "#6b3e2e",
      "#26191c",
      "#0b0808"
    ],

    space:[
      "#18205b",
      "#090b25",
      "#03030a"
    ],

    lava:[
      "#672313",
      "#26100d",
      "#090505"
    ],

    cyber:[
      "#063c4c",
      "#10152e",
      "#03070d"
    ],

    sky:[
      "#315b86",
      "#182945",
      "#08101d"
    ],

    glitch:[
      "#4a164d",
      "#141126",
      "#05050a"
    ],

    void:[
      "#17121f",
      "#08070c",
      "#000000"
    ],

    kingdom:[
      "#4d174a",
      "#171331",
      "#07050e"
    ]

  };

  const t =
    themes[theme];

  world.style.background =
    `
    radial-gradient(
      circle at 50% 15%,
      ${t[0]},
      ${t[1]} 45%,
      ${t[2]}
    )
    `;

}


/* =========================================================
   HUD
   ========================================================= */

function updateHUD(){

  document.getElementById(
    "hudLevel"
  ).textContent =
    currentLevel + 1;

  document.getElementById(
    "hudScore"
  ).textContent =
    Math.floor(score);

  document.getElementById(
    "hudCoins"
  ).textContent =
    levelCoins;

  document.getElementById(
    "hudGems"
  ).textContent =
    levelGems;

  document.getElementById(
    "hudLives"
  ).textContent =
    lives;

  document.getElementById(
    "hudShield"
  ).textContent =
    shield;

}


/* =========================================================
   JUMP
   ========================================================= */

function jump(){

  if(!running)
    return;

  if(jumpsLeft > 0){

    velocityY =
      15 +
      owned("jump") * 1.4;

    jumping = true;

    jumpsLeft--;

  }

}

let jumping = false;


/* =========================================================
   LAND
   ========================================================= */

function land(){

  playerBottom = 85;

  velocityY = 0;

  jumping = false;

  jumpsLeft =
    owned("double") ? 2 : 1;

}


/* =========================================================
   OBSTACLE
   ========================================================= */

function createObstacle(){

  const element =
    document.createElement("div");

  element.className =
    "gyat-obstacle";

  const random =
    Math.random();

  if(random < .18)
    element.classList.add(
      "gyat-tall"
    );

  else if(random < .35)
    element.classList.add(
      "gyat-wide"
    );

  const x =
    window.innerWidth + 60;

  element.style.left =
    x + "px";

  world.appendChild(element);

  obstacles.push({

    element,

    x

  });

}


/* =========================================================
   COIN
   ========================================================= */

function createCoin(){

  const element =
    document.createElement("div");

  element.className =
    "gyat-coin";

  const x =
    window.innerWidth + 60;

  const height =
    140 +
    Math.random()*150;

  element.style.left =
    x + "px";

  element.style.bottom =
    height + "px";

  world.appendChild(element);

  coins.push({

    element,

    x

  });

}


/* =========================================================
   GEM
   ========================================================= */

function createGem(){

  const element =
    document.createElement("div");

  element.className =
    "gyat-gem";

  const x =
    window.innerWidth + 60;

  const height =
    150 +
    Math.random()*140;

  element.style.left =
    x + "px";

  element.style.bottom =
    height + "px";

  world.appendChild(element);

  gems.push({

    element,

    x

  });

}


/* =========================================================
   LASER
   ========================================================= */

function createLaser(){

  const laser =
    document.createElement("div");

  laser.className =
    "gyat-laser";

  const x =
    window.innerWidth + 100;

  const y =
    130 +
    Math.random()*190;

  laser.style.left =
    x + "px";

  laser.style.bottom =
    y + "px";

  laser.style.width =
    "110px";

  world.appendChild(laser);

  lasers.push({

    element:laser,

    x

  });

}


/* =========================================================
   COLLISION
   ========================================================= */

function collision(a,b){

  const ar =
    a.getBoundingClientRect();

  const br =
    b.getBoundingClientRect();

  return !(
    ar.right < br.left ||
    ar.left > br.right ||
    ar.bottom < br.top ||
    ar.top > br.bottom
  );

}


/* =========================================================
   HIT
   ========================================================= */

function hitPlayer(){

  if(shield > 0){

    shield--;

    flash();

    shake();

    updateHUD();

    return;

  }

  lives--;

  flash();

  shake();

  updateHUD();

  if(lives <= 0)
    gameOver();

}


/* =========================================================
   FLASH
   ========================================================= */

function flash(){

  const f =
    document.createElement("div");

  f.className =
    "gyat-flash";

  effects.appendChild(f);

  f.classList.add("active");

  setTimeout(
    ()=>f.remove(),
    300
  );

}


/* =========================================================
   SHAKE
   ========================================================= */

function shake(){

  world.classList.remove(
    "gyat-shake"
  );

  void world.offsetWidth;

  world.classList.add(
    "gyat-shake"
  );

}


/* =========================================================
   TROLLS
   ========================================================= */

function troll(){

  if(
    currentLevel === 2 &&
    score > 500 &&
    score - lastTroll > 450
  ){

    lastTroll = score;

    fakeCoinTroll();

  }

  if(
    currentLevel === 7 &&
    score > 800 &&
    score - lastTroll > 600
  ){

    lastTroll = score;

    glitchTroll();

  }

  if(
    currentLevel === 9 &&
    score > 1000 &&
    score - lastTroll > 700
  ){

    lastTroll = score;

    fakeWinTroll();

  }

}


/* =========================================================
   FAKE COIN
   ========================================================= */

function fakeCoinTroll(){

  const trollCoin =
    document.createElement("div");

  trollCoin.className =
    "gyat-coin";

  trollCoin.textContent =
    "💀";

  trollCoin.style.fontSize =
    "19px";

  trollCoin.style.textAlign =
    "center";

  trollCoin.style.paddingTop =
    "2px";

  trollCoin.style.left =
    window.innerWidth + "px";

  trollCoin.style.bottom =
    "170px";

  world.appendChild(
    trollCoin
  );

  let x =
    window.innerWidth;

  function move(){

    if(!running){

      trollCoin.remove();

      return;

    }

    x -= speed;

    trollCoin.style.left =
      x + "px";

    if(
      collision(
        player,
        trollCoin
      )
    ){

      trollCoin.remove();

      shake();

      return;

    }

    if(x < -100){

      trollCoin.remove();

      return;

    }

    requestAnimationFrame(
      move
    );

  }

  move();

}


/* =========================================================
   GLITCH TROLL
   ========================================================= */

function glitchTroll(){

  world.style.filter =
    "hue-rotate(90deg)";

  setTimeout(
    ()=>{
      world.style.filter =
        "";
    },
    900
  );

}


/* =========================================================
   FAKE WIN TROLL
   ========================================================= */

function fakeWinTroll(){

  const message =
    document.createElement("div");

  message.style.position =
    "absolute";

  message.style.inset =
    "0";

  message.style.zIndex =
    "999";

  message.style.display =
    "grid";

  message.style.placeItems =
    "center";

  message.style.background =
    "rgba(0,0,0,.85)";

  message.style.fontSize =
    "clamp(30px,7vw,70px)";

  message.style.fontWeight =
    "900";

  message.textContent =
    "YOU WON! 😂";

  world.appendChild(
    message
  );

  setTimeout(
    ()=>message.remove(),
    1100
  );

}


/* =========================================================
   LEVEL-SPECIFIC EFFECTS
   ========================================================= */

function levelEffects(){

  const theme =
    levels[currentLevel].theme;

  /* Desert sandstorm */

  if(
    theme === "desert" &&
    frame % 240 === 0
  ){

    world.style.filter =
      "brightness(.72)";

    setTimeout(
      ()=>{
        world.style.filter =
          "";
      },
      1300
    );

  }


  /* Space gravity */

  if(theme === "space"){

    if(jumping){

      velocityY += .25;

    }

  }


  /* Lava shake */

  if(
    theme === "lava" &&
    frame % 180 === 0
  ){

    shake();

  }


  /* Cyber lasers */

  if(
    theme === "cyber" &&
    frame % 150 === 0
  ){

    createLaser();

  }


  /* Glitch */

  if(
    theme === "glitch" &&
    frame % 220 === 0
  ){

    glitchTroll();

  }


  /* Void darkness */

  if(theme === "void"){

    world.style.filter =
      frame % 100 < 50
      ? "brightness(.72)"
      : "brightness(.9)";

  }


  /* Kingdom */

  if(
    theme === "kingdom" &&
    frame % 240 === 0
  ){

    createGem();

  }

}


/* =========================================================
   GAME LOOP
   ========================================================= */

function loop(){

  if(!running)
    return;


  frame++;


  /* PLAYER */

  if(jumping){

    playerBottom +=
      velocityY;

    velocityY -=
      gravity;

    if(playerBottom <= 85){

      land();

    }

    player.style.bottom =
      playerBottom + "px";

  }


  /* SCORE */

  score +=
    .08 * speed;


  /* SPAWNING */

  const spawn =
    Math.max(
      45,
      levels[currentLevel].spawn -
      Math.floor(score/250)
    );


  if(
    frame % spawn === 0
  ){

    createObstacle();

  }


  if(
    frame % 72 === 0
  ){

    createCoin();

  }


  if(
    frame % 175 === 0
  ){

    createGem();

  }


  /* LEVEL EFFECTS */

  levelEffects();

  troll();


  /* OBSTACLES */

  for(
    let i=obstacles.length-1;
    i>=0;
    i--
  ){

    const o =
      obstacles[i];

    o.x -= speed;

    o.element.style.left =
      o.x + "px";


    if(
      collision(
        player,
        o.element
      )
    ){

      o.element.remove();

      obstacles.splice(i,1);

      hitPlayer();

      continue;

    }


    if(o.x < -120){

      o.element.remove();

      obstacles.splice(i,1);

    }

  }


  /* COINS */

  for(
    let i=coins.length-1;
    i>=0;
    i--
  ){

    const c =
      coins[i];

    c.x -= speed;

    c.element.style.left =
      c.x + "px";


    let collected =
      collision(
        player,
        c.element
      );


    /* Magnet */

    if(
      owned("magnet") &&
      c.x > 0 &&
      c.x < 600
    ){

      const p =
        player.getBoundingClientRect();

      const cr =
        c.element.getBoundingClientRect();

      if(
        Math.abs(
          cr.left -
          p.left
        ) < 170
      ){

        collected = true;

      }

    }


    if(collected){

      levelCoins++;

      c.element.remove();

      coins.splice(i,1);

      continue;

    }


    if(c.x < -100){

      c.element.remove();

      coins.splice(i,1);

    }

  }


  /* GEMS */

  for(
    let i=gems.length-1;
    i>=0;
    i--
  ){

    const g =
      gems[i];

    g.x -= speed;

    g.element.style.left =
      g.x + "px";


    if(
      collision(
        player,
        g.element
      )
    ){

      levelGems +=
        1 +
        owned("gem");

      g.element.remove();

      gems.splice(i,1);

      continue;

    }


    if(g.x < -100){

      g.element.remove();

      gems.splice(i,1);

    }

  }


  /* LASERS */

  for(
    let i=lasers.length-1;
    i>=0;
    i--
  ){

    const l =
      lasers[i];

    l.x -=
      speed * 1.2;

    l.element.style.left =
      l.x + "px";


    if(
      collision(
        player,
        l.element
      )
    ){

      l.element.remove();

      lasers.splice(i,1);

      hitPlayer();

      continue;

    }


    if(l.x < -200){

      l.element.remove();

      lasers.splice(i,1);

    }

  }


  updateHUD();


  /* WIN */

  if(
    score >=
    levels[currentLevel].target
  ){

    finishLevel();

    return;

  }


  requestAnimationFrame(
    loop
  );

}


/* =========================================================
   GAME OVER
   ========================================================= */

function gameOver(){

  running = false;

  document.getElementById(
    "overScore"
  ).textContent =
    Math.floor(score);

  document.getElementById(
    "overCoins"
  ).textContent =
    levelCoins;

  document.getElementById(
    "overGems"
  ).textContent =
    levelGems;

  over.style.display =
    "flex";

}


/* =========================================================
   FINISH
   ========================================================= */

function finishLevel(){

  running = false;

  save.coins +=
    levelCoins;

  save.gems +=
    levelGems;


  const target =
    levels[currentLevel].target;


  let stars = 1;


  if(
    score >= target * 1.35
  ){

    stars = 2;

  }


  if(
    score >= target * 1.7 &&
    lives === 3 + owned("life")
  ){

    stars = 3;

  }


  if(
    stars >
    (save.stars[currentLevel] || 0)
  ){

    save.stars[currentLevel] =
      stars;

  }


  /* Unlock next */

  if(
    currentLevel + 1 <
    levels.length
  ){

    save.unlocked =
      Math.max(
        save.unlocked,
        currentLevel + 2
      );

  }


  saveGame();

  document.getElementById(
    "completeScore"
  ).textContent =
    Math.floor(score);

  document.getElementById(
    "completeCoins"
  ).textContent =
    levelCoins;

  document.getElementById(
    "completeGems"
  ).textContent =
    levelGems;

  document.getElementById(
    "resultStars"
  ).textContent =
    "⭐".repeat(stars) +
    "☆".repeat(3-stars);


  if(
    currentLevel <
    levels.length-1
  ){

    document.getElementById(
      "nextButton"
    ).textContent =
      "NEXT LEVEL ➡️";

  }
  else{

    document.getElementById(
      "nextButton"
    ).textContent =
      "🏆 FINISH";

  }


  complete.style.display =
    "flex";

}


/* =========================================================
   CLEAR OBJECTS
   ========================================================= */

function clearObjects(){

  obstacles.forEach(
    x=>x.element.remove()
  );

  coins.forEach(
    x=>x.element.remove()
  );

  gems.forEach(
    x=>x.element.remove()
  );

  lasers.forEach(
    x=>x.element.remove()
  );

  obstacles = [];

  coins = [];

  gems = [];

  lasers = [];

}


/* =========================================================
   BUTTONS
   ========================================================= */

document
  .getElementById("shopButton")
  .addEventListener(
    "click",
    openShop
  );


document
  .getElementById("shopBack")
  .addEventListener(
    "click",
    showLevels
  );


document
  .getElementById("gyatExit")
  .addEventListener(
    "click",
    ()=>{
      running = false;
      clearObjects();
      game.style.display = "none";
    }
  );


document
  .getElementById("gameLevels")
  .addEventListener(
    "click",
    showLevels
  );


document
  .getElementById("startButton")
  .addEventListener(
    "click",
    startLevel
  );


document
  .getElementById("retryButton")
  .addEventListener(
    "click",
    startLevel
  );


document
  .getElementById("overLevelButton")
  .addEventListener(
    "click",
    showLevels
  );


document
  .getElementById("completeLevelButton")
  .addEventListener(
    "click",
    showLevels
  );


document
  .getElementById("nextButton")
  .addEventListener(
    "click",
    ()=>{

      if(
        currentLevel <
        levels.length-1
      ){

        openLevel(
          currentLevel+1
        );

      }
      else{

        showLevels();

      }

    }
  );


document
  .getElementById("gyatJump")
  .addEventListener(
    "pointerdown",
    event=>{

      event.preventDefault();

      jump();

    }
  );


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
  "keydown",
  event=>{

    if(
      game.style.display !==
      "block"
    )
      return;


    if(
      event.code === "Space" ||
      event.code === "ArrowUp" ||
      event.code === "KeyW"
    ){

      event.preventDefault();

      jump();

    }


    if(
      event.code === "Escape"
    ){

      showLevels();

    }

  }
);


})();
```
