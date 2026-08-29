const games = [
["Among Us","casual","👽"],["Minecraft","action","⛏️"],["Fortnite","action","🏗️"],["Roblox","casual","🟥"],
["Call of Duty: Mobile","action","🎯"],["Candy Crush Saga","casual","🍬"],["Clash of Clans","strategy","⚔️"],
["Subway Surfers","arcade","🚆"],["PUBG Mobile","action","🪖"],["League of Legends","action","🧙"],
["Genshin Impact","action","✨"],["Apex Legends","action","🔫"],["Valorant","action","🎯"],["Hollow Knight","action","🪲"],
["Overwatch 2","action","🦸"],["The Sims 4","casual","🏠"],["Stardew Valley","casual","🌾"],["Terraria","action","🌲"],
["Rocket League","action","🚗"],["Bloons TD 6","strategy","🐒"],["Geometry Dash","arcade","🔺"],["Brawlhalla","action","🥊"],
["Super Smash Bros","action","💥"],["Pokemon Unite","action","⚡"],["Halo Infinite","action","👽"],["Hades","action","🔥"],
["Celeste","arcade","🏔️"],["Dead Cells","action","💀"],["Slay the Spire","strategy","🃏"],["Gris","casual","🎨"],
["Limbo","arcade","🌑"],["Inside","arcade","👁️"],["FIFA Mobile","casual","⚽"],["NBA 2K Mobile","action","🏀"],
["Mario Kart Tour","arcade","🏎️"],["Animal Crossing","casual","🍃"],["Pikmin Bloom","casual","🌱"],
["Plants vs Zombies","strategy","🌻"],["Temple Run","arcade","🏃"],["Angry Birds","arcade","🐦"],
["2048","casual","🔢"],["Cut the Rope","casual","🍭"],["Fruit Ninja","arcade","🍉"],["Asphalt 9","action","🏎️"],
["Need for Speed","action","🚘"],["CSR Racing 2","action","🏁"],["Real Racing 3","action","🏎️"],["Jetpack Joyride","arcade","🚀"],
["Crossy Road","arcade","🐔"],["Flappy Bird","arcade","🐤"],["Doodle Jump","arcade","🟢"],["Monument Valley","casual","🏛️"],
["Alto's Adventure","arcade","🏂"],["Alto's Odyssey","arcade","🏜️"],["Shadow Fight 3","action","🥷"],
["Evil Nun","action","👻"],["Five Nights at Freddy's","action","🐻"],["World of Tanks Blitz","action","🛡️"],
["War Robots","action","🤖"],["Modern Combat 5","action","🔫"],["Battlelands Royale","action","💣"],
["Stick Fight","action","🥢"],["Magic Arena","strategy","🪄"],["Yu-Gi-Oh! Master Duel","strategy","🃏"],
["Clash Royale","strategy","👑"],["Archero","action","🏹"],["Soul Knight","action","⚔️"],["Granny","action","🏚️"],
["Tomb of the Mask","arcade","😷"],["Paper.io","arcade","📄"],["Agar.io","casual","⚪"],["Slither.io","casual","🐍"],
["Hole.io","arcade","🕳️"],["Stack","arcade","🧱"],["Chess","strategy","♟️"],["Wordscapes","casual","🔤"],
["QuizUp","casual","❓"],["Kahoot!","casual","🧠"],["Trivia Crack","casual","💡"],["Tetris","arcade","🧩"],
["Uno Online","casual","🃏"],["Skribbl.io","casual","✏️"],["Draw Something","casual","🎨"],["Words With Friends","casual","🔤"],
["Heads Up!","casual","😆"],["Exploding Kittens","casual","🐱"],["Minesweeper","strategy","💣"],["Sudoku","strategy","🔢"],
["Pictionary","casual","🖍️"],["Ludo King","strategy","🎲"],["Monopoly","strategy","💰"],["Catan","strategy","🏝️"],
["Carcassonne","strategy","🏰"],["Risk","strategy","🌎"],["Scrabble","strategy","🔤"],["Checkers","strategy","🔴"],
["Solitaire","casual","🃏"],["Mahjong","casual","🀄"],["Yahtzee","casual","🎲"],["Dominoes","casual","🁫"],
["Go","strategy","⚫"],["Backgammon","strategy","🎲"],["Snake","arcade","🐍"],["Pac-Man","arcade","👻"],
["Space Invaders","arcade","👾"],["Asteroids","arcade","☄️"],["Bomberman","arcade","💣"],["Frogger","arcade","🐸"],
["Pong","arcade","🏓"],["Connect Four","strategy","🔴"],["Battleship","strategy","🚢"],["Hangman","casual","🔤"]
];

const target = "https://www.youtube.com/watch?v=V-_O7nl0Ii0";
const colors = ["#8b5cf6","#ec4899","#22d3ee","#f59e0b","#10b981","#6366f1"];
const gamesEl = document.getElementById("games");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const searchEl = document.getElementById("search");
let activeFilter = "all";

function render() {
  const query = searchEl.value.trim().toLowerCase();

  // Original Rickroll behavior remains.
  if (query === "rickroll") {
    window.location.href = target;
    return;
  }

  const filtered = games.filter(g => {
    const matchesSearch = g[0].toLowerCase().includes(query);
    const matchesFilter = activeFilter === "all" || g[1] === activeFilter;
    return matchesSearch && matchesFilter;
  });

  countEl.textContent = `${filtered.length} games`;
  gamesEl.innerHTML = filtered.map((g, i) => `
    <article class="game-card" style="--accent:${colors[i % colors.length]}">
      <div class="game-icon">${g[2]}</div>
      <h3>${g[0]}</h3>
      <p>${g[1].charAt(0).toUpperCase()+g[1].slice(1)} • Free to browse</p>
      <a class="play" href="${target}" target="_blank" rel="noopener noreferrer">▶ Play Now</a>
    </article>
  `).join("");

  emptyEl.classList.toggle("hidden", filtered.length !== 0);
  gamesEl.classList.toggle("hidden", filtered.length === 0);
}

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });
});

searchEl.addEventListener("input", render);
document.getElementById("clearSearch").addEventListener("click", () => {
  searchEl.value = "";
  searchEl.focus();
  render();
});


// Secret game is implemented in secret.js.
// Typing "secret" is handled here so the game remains hidden from the normal game list.
searchEl.addEventListener("input", () => {
  if (searchEl.value.trim().toLowerCase() === "secret" && typeof openSecretGame === "function") {
    openSecretGame();
  }
});

