/* ================= SECRET GAME =================
   Gyat Dash: Chaos Levels
   The secret game is intentionally separate from the main game list.
*/

const levels = [
  {name:"Warm Up", icon:"🌟", desc:"Classic jumps", bg:"normal", quirk:"blocks", trolls:0, speed:1.00, distance:3200, obstacles:13},
  {name:"Neon Road", icon:"💜", desc:"Moving walls", bg:"neon", quirk:"moving", trolls:0, speed:1.06, distance:3500, obstacles:15},
  {name:"Coin Flip", icon:"🪙", desc:"Some coins aren't what they seem", bg:"purple", quirk:"cointrap", trolls:3, speed:1.10, distance:3700, obstacles:15},
  {name:"Lava Panic", icon:"🌋", desc:"Dodge the rising fire", bg:"lava", quirk:"geyser", trolls:1, speed:1.15, distance:4000, obstacles:17},
  {name:"Fake Finish", icon:"🏁", desc:"When you see the flag, don't celebrate", bg:"glitch", quirk:"fakefinish", trolls:2, speed:1.18, distance:4300, obstacles:17},
  {name:"Moon Jump", icon:"🌙", desc:"Floating rocks drift through the air", bg:"moon", quirk:"floaters", trolls:1, speed:1.22, distance:4600, obstacles:19},
  {name:"Troll City", icon:"👹", desc:"Time the gaps between laser beams", bg:"red", quirk:"lasers", trolls:3, speed:1.28, distance:4900, obstacles:20},
  {name:"Speed Demon", icon:"⚡", desc:"Crushers close in from above", bg:"speed", quirk:"crushers", trolls:2, speed:1.35, distance:5200, obstacles:21},
  {name:"Chaos Mode", icon:"🌀", desc:"Hazards blink in and out", bg:"chaos", quirk:"blink", trolls:4, speed:1.42, distance:5500, obstacles:23},
  {name:"GYAT MASTER", icon:"👑", desc:"Every trick. No mercy.", bg:"gold", quirk:"combo", trolls:6, speed:1.50, distance:6000, obstacles:27}
];

let progress = Math.max(3, Number(localStorage.getItem("gyatProgress") || 3));
let coins = Number(localStorage.getItem("gyatCoins") || 0);
let inventory = JSON.parse(localStorage.getItem("gyatInventory") || "{}");
let currentLevel = 0;
let runTimer = null;
let jumpTimer = null;
let cooldownTimer = null;
let jumped = false;
let jumpCooling = false;
let distanceTravelled = 0;
let obstacleData = [];
let runPaused = false;

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
const jumpButton = document.getElementById("jumpButton");

function saveGame(){
  localStorage.setItem("gyatProgress", String(progress));
  localStorage.setItem("gyatCoins", String(coins));
  localStorage.setItem("gyatInventory", JSON.stringify(inventory));
}
function updateCoins(){
  coinText.textContent = coins;
  shopCoins.textContent = coins;
  playCoins.textContent = coins;
}
function renderLevels(){
  levelsEl.innerHTML = levels.map((level,i)=>{
    const unlocked = i < progress;
    const stars = i < Math.max(0,progress-1) ? "★★★" : "☆☆☆";
    return `<button class="level-card ${unlocked?"":"locked"}" data-level="${i}" ${unlocked?"":"disabled"}>
      <span class="level-number">${i+1}</span><span class="level-icon">${unlocked?level.icon:"🔒"}</span>
      <b>${level.name}</b><small>${level.desc}</small><span class="stars">${stars}</span>
    </button>`;
  }).join("");
  document.querySelectorAll(".level-card:not(.locked)").forEach(btn=>btn.addEventListener("click",()=>startLevel(Number(btn.dataset.level))));
  updateCoins();
}
function openSecretGame(){
  secretGame.classList.remove("hidden");
  levelScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  shopScreen.classList.add("hidden");
  renderLevels();
  secretGame.scrollIntoView({behavior:"smooth",block:"start"});
}

function addObstacle(el,x,type,extra={}){
  el.style.left = `${x}px`;
  gameArea.appendChild(el);
  obstacleData.push({el,x,type,...extra});
}
function makeObstacle(emoji,x,wide=false){
  const el=document.createElement("div");
  el.className="obstacle"+(wide?" wide-obstacle":"");
  el.textContent=emoji;
  addObstacle(el,x,"normal");
}
function makeTroll(x){
  const el=document.createElement("div");
  el.className="obstacle hidden-troll";
  el.textContent=["🪨","📦","🌳","🪵"][Math.floor(Math.random()*4)];
  addObstacle(el,x,"troll");
}
function makeCoin(x,y,trap=false){
  const c=document.createElement("div");
  c.className="coin";
  c.textContent="🪙";
  c.style.top=`${y}px`;
  c.dataset.worldX=String(x);
  c.dataset.trollCoin=trap?"1":"0";
  gameArea.appendChild(c);
}
function makeLaser(x,high=false){
  const el=document.createElement("div");
  el.className="laser";
  el.innerHTML="<span>⚡</span>";
  el.style.bottom=high?"122px":"38px";
  addObstacle(el,x,"laser",{high});
}
function makeFloater(x,i){
  const el=document.createElement("div");
  el.className="floating-obstacle";
  el.textContent=["☄️","🪨","🛸"][i%3];
  el.style.bottom=`${90+(i%3)*38}px`;
  addObstacle(el,x,"floater",{phase:i,base:90+(i%3)*38});
}
function makeCrusher(x,i){
  const el=document.createElement("div");
  el.className="crusher";
  el.textContent="⬇️";
  el.style.bottom="130px";
  addObstacle(el,x,"crusher",{phase:i});
}
function makeGeyser(x,i){
  const el=document.createElement("div");
  el.className="lava-geyser";
  el.textContent="🔥";
  el.style.bottom="26px";
  addObstacle(el,x,"geyser",{phase:i});
}
function makeBlink(x,i){
  const el=document.createElement("div");
  el.className="blink-obstacle";
  el.textContent=i%2?"❌":"💠";
  el.style.bottom=`${28+(i%3)*34}px`;
  addObstacle(el,x,"blink",{phase:i});
}
function makeFakeFinish(x){
  const el=document.createElement("div");
  el.className="fake-finish";
  el.textContent="🏁";
  addObstacle(el,x,"fake");
}

function clearCourse(){
  gameArea.querySelectorAll(".obstacle,.coin,.fake-finish,.real-finish").forEach(e=>e.remove());
  obstacleData=[];
}
function buildCourse(level){
  const total = level.obstacles + level.trolls;
  const startX=430;
  const spacing=Math.max(180,Math.floor((level.distance-250)/total));
  const xs=Array.from({length:total},(_,i)=>startX+i*spacing+Math.floor(Math.random()*55));
  const q=level.quirk;

  if(q==="blocks") xs.forEach((x,i)=>makeObstacle(i%3===0?"🪨":"🧱",x,i%5===0));
  if(q==="moving") xs.forEach((x,i)=>{
    const el=document.createElement("div"); el.className="moving-obstacle"; el.textContent=i%2?"🧱":"🔷";
    el.style.bottom=`${35+(i%4)*25}px`; addObstacle(el,x,"moving",{phase:i});
  });
  if(q==="cointrap") xs.forEach((x,i)=>makeCoin(x,48+(i%3)*38,i%4===1));
  if(q==="geyser") xs.forEach((x,i)=>makeGeyser(x,i));
  if(q==="fakefinish") xs.forEach((x,i)=>makeObstacle(i%2?"🧱":"⚠️",x,i%6===0));
  if(q==="floaters") xs.forEach((x,i)=>makeFloater(x,i));
  if(q==="lasers") xs.forEach((x,i)=>makeLaser(x,i%3===1));
  if(q==="crushers") xs.forEach((x,i)=>makeCrusher(x,i));
  if(q==="blink") xs.forEach((x,i)=>makeBlink(x,i));
  if(q==="combo") xs.forEach((x,i)=>{
    const m=i%5;
    if(m===0) makeLaser(x,i%2===0);
    else if(m===1) makeFloater(x,i);
    else if(m===2) makeCrusher(x,i);
    else if(m===3) makeObstacle("🧱",x,true);
    else makeCoin(x,55+(i%2)*40,i%3===0);
  });

  // Add extra ordinary coins to every level so coins aren't limited to one mechanic.
  for(let i=1;i<Math.floor(level.distance/650);i++){
    const x=350+i*650;
    if(q!=="cointrap") makeCoin(x,45+(i%2)*42,false);
  }

  // Fake finishes are hidden among the course and look exactly like the real flag.
  if(q==="fakefinish"){
    makeFakeFinish(Math.floor(level.distance*0.42));
    makeFakeFinish(Math.floor(level.distance*0.70));
  }
}

function startLevel(index){
  if(index>=progress) return;
  stopRun();
  currentLevel=index;
  const level=levels[index];
  levelScreen.classList.add("hidden"); shopScreen.classList.add("hidden"); gameScreen.classList.remove("hidden");
  levelTitle.textContent=`Level ${index+1} — ${level.name}`;
  levelHint.textContent=level.desc;
  gameArea.className=`game-area theme-${level.bg}`;
  gameMessage.textContent="GO!";
  player.className="";
  player.style.left="35px"; player.style.bottom="28px";
  goal.style.display="none";
  distanceTravelled=0; jumped=false; jumpCooling=false; runPaused=false;
  jumpButton.disabled=false; jumpButton.textContent="⬆ JUMP";
  clearCourse();
  buildCourse(level);
  runTimer=setInterval(updateRun,30);
}
function stopRun(){
  if(runTimer){clearInterval(runTimer);runTimer=null;}
  if(jumpTimer){clearTimeout(jumpTimer);jumpTimer=null;}
  if(cooldownTimer){clearTimeout(cooldownTimer);cooldownTimer=null;}
  runPaused=false;
}

function updateRun(){
  if(runPaused) return;
  const level=levels[currentLevel];
  distanceTravelled += 3.0*level.speed+(inventory.speed?0.6:0);
  player.style.left="35px";

  obstacleData.forEach(o=>{
    o.el.style.left=`${o.x-distanceTravelled}px`;
    if(o.type==="moving") o.el.style.transform=`translateY(${Math.sin((distanceTravelled+o.phase*90)/28)*48}px)`;
    if(o.type==="floater") o.el.style.bottom=`${o.base+Math.sin((distanceTravelled+o.phase*110)/32)*32}px`;
    if(o.type==="crusher") o.el.style.transform=`translateY(${Math.max(0,Math.sin((distanceTravelled+o.x)/19))*72}px)`;
    if(o.type==="geyser") o.el.style.transform=`scaleY(${0.35+Math.max(0,Math.sin((distanceTravelled+o.phase*80)/17))*1.15})`;
    if(o.type==="blink") o.el.style.opacity=(Math.sin((distanceTravelled+o.phase*120)/17)>-0.05)?"1":"0.10";
  });

  gameArea.querySelectorAll(".coin").forEach(c=>{
    const x=Number(c.dataset.worldX)-distanceTravelled;
    c.style.left=`${x}px`;
    if(c.dataset.taken) return;
    const a=player.getBoundingClientRect(),b=c.getBoundingClientRect();
    if(a.right>b.left&&a.left<b.right&&a.bottom>b.top&&a.top<b.bottom){
      c.dataset.taken="1"; c.style.opacity="0";
      if(c.dataset.trollCoin==="1") { failLevel("coin"); return; }
      coins += inventory.magnet?2:1; saveGame(); updateCoins();
    }
  });

  checkCollisions();
  if(distanceTravelled>=level.distance) finishLevel();
}

function checkCollisions(){
  if(runPaused) return;
  const p=player.getBoundingClientRect();
  obstacleData.forEach(o=>{
    if(o.el.dataset.hit) return;
    const r=o.el.getBoundingClientRect();
    if(!(p.right>r.left+5&&p.left<r.right-5&&p.bottom>r.top+5&&p.top<r.bottom-5)) return;

    if(o.type==="fake"){
      o.el.dataset.hit="1";
      runPaused=true;
      gameMessage.textContent="🎉 LEVEL COMPLETE!";
      // Deliberately indistinguishable from the real finish for a moment.
      setTimeout(()=>{
        if(!runPaused) return;
        gameMessage.textContent="";
        gameArea.classList.add("shake");
        setTimeout(()=>{gameArea.classList.remove("shake");failLevel("fake");},250);
      },1100);
      return;
    }

    if(o.type==="troll") { failLevel("troll"); return; }
    if(["laser","floater","moving","crusher","geyser"].includes(o.type)) {
      // High hazards can be jumped; low hazards need a jump too, but the collision
      // box is positioned at their actual height so timing matters.
      if(!jumped) failLevel(o.type);
      return;
    }
    if(o.type==="blink" && o.el.style.opacity!=="0.10") {
      if(!jumped) failLevel("blink");
      return;
    }
    if(o.type==="normal" && !jumped) failLevel("obstacle");
  });
}

function jump(){
  if(!runTimer||jumped||jumpCooling||runPaused) return;
  jumped=true; jumpCooling=true;
  jumpButton.disabled=true;
  jumpButton.textContent="⏳ COOLDOWN";
  player.classList.add("jumping");
  clearTimeout(jumpTimer); clearTimeout(cooldownTimer);
  const duration=levels[currentLevel].bg==="moon"?560:430;
  jumpTimer=setTimeout(()=>{
    jumped=false;
    player.classList.remove("jumping");
  },duration);
  cooldownTimer=setTimeout(()=>{
    jumpCooling=false;
    jumpButton.disabled=false;
    jumpButton.textContent="⬆ JUMP";
  },850);
}

function finishLevel(){
  if(!runTimer) return;
  stopRun();
  coins += 5+(inventory.magnet?2:0);
  if(currentLevel+1<levels.length) progress=Math.max(progress,currentLevel+2);
  saveGame(); updateCoins(); renderLevels();
  gameMessage.textContent=currentLevel===9?"👑 GYAT MASTER DEFEATED!":"🎉 LEVEL COMPLETE! +COINS";
  goal.style.display="block";
  gameArea.classList.add("win-flash");
  setTimeout(()=>{
    gameArea.classList.remove("win-flash");
    gameScreen.classList.add("hidden"); levelScreen.classList.remove("hidden"); renderLevels();
  },1300);
}
function failLevel(reason="troll"){
  if(!runTimer&&!runPaused) return;
  stopRun();
  gameMessage.textContent="💀 GOT TROLLED!";
  gameArea.classList.add("shake");
  setTimeout(()=>{gameArea.classList.remove("shake");startLevel(currentLevel);},850);
}

jumpButton.addEventListener("click",jump);
document.addEventListener("keydown",e=>{
  if((e.code==="Space"||e.code==="ArrowUp")&&!gameScreen.classList.contains("hidden")){e.preventDefault();jump();}
});
document.getElementById("backLevels").addEventListener("click",()=>{stopRun();gameScreen.classList.add("hidden");levelScreen.classList.remove("hidden");renderLevels();});
document.getElementById("closeGame").addEventListener("click",()=>{stopRun();secretGame.classList.add("hidden");});
document.getElementById("shopButton").addEventListener("click",()=>{stopRun();levelScreen.classList.add("hidden");shopScreen.classList.remove("hidden");updateCoins();});
document.getElementById("closeShop").addEventListener("click",()=>{shopScreen.classList.add("hidden");levelScreen.classList.remove("hidden");renderLevels();});

document.querySelectorAll(".shop-item").forEach(item=>{
  const key=item.dataset.item;
  if(inventory[key]){item.classList.add("owned");item.querySelector("strong").textContent="OWNED ✓";}
  item.addEventListener("click",()=>{
    const cost=Number(item.dataset.cost);
    if(inventory[key]) return;
    if(coins<cost){alert(`You need ${cost-coins} more coins!`);return;}
    coins-=cost; inventory[key]=true; saveGame(); updateCoins();
    item.classList.add("owned"); item.querySelector("strong").textContent="OWNED ✓";
  });
});

renderLevels();
