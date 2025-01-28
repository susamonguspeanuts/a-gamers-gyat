import React, { useState } from "react";

const gamesList = [
  "Among Us",
  "Minecraft",
  "Fortnite",
  "Roblox",
  "Call of Duty: Mobile",
  "Candy Crush Saga",
  "Clash of Clans",
  "Subway Surfers",
  "PUBG Mobile",
  "League of Legends",
  "Genshin Impact",
  "Apex Legends",
  "Valorant",
  "Hollow Knight",
  "Overwatch 2",
  "The Sims 4",
  "Stardew Valley",
  "Terraria",
  "Rocket League",
  "Bloons TD 6",
  "Geometry Dash",
  "Brawlhalla",
  "Super Smash Bros",
  "Zelda: Breath of the Wild",
  "Pokemon Unite",
  "Halo Infinite",
  "Hades",
  "Celeste",
  "Dead Cells",
  "Slay the Spire",
  "Gris",
  "Limbo",
  "Inside",
  "FIFA Mobile",
  "NBA 2K Mobile",
  "Mario Kart Tour",
  "Animal Crossing: Pocket Camp",
  "Pikmin Bloom",
  "Plants vs Zombies",
  "Temple Run",
  "Angry Birds",
  "2048",
  "Cut the Rope",
  "Fruit Ninja",
  "Asphalt 9: Legends",
  "Need for Speed: No Limits",
  "CSR Racing 2",
  "Real Racing 3",
  "Jetpack Joyride",
  "Crossy Road",
  "Flappy Bird",
  "Doodle Jump",
  "Monument Valley",
  "Alto's Adventure",
  "Alto's Odyssey",
  "Shadow Fight 3",
  "Evil Nun",
  "Five Nights at Freddy's",
  "World of Tanks Blitz",
  "War Robots",
  "Modern Combat 5",
  "Battlelands Royale",
  "Stick Fight",
  "Magic: The Gathering Arena",
  "Yu-Gi-Oh! Master Duel",
  "Clash Royale",
  "Archero",
  "Soul Knight",
  "Granny",
  "Tomb of the Mask",
  "Paper.io",
  "Agar.io",
  "Slither.io",
  "Hole.io",
  "Stack",
  "Chess.com",
  "Wordscapes",
  "QuizUp",
  "Kahoot!",
  "Trivia Crack",
  "Tetris",
  "Uno Online",
  "Scribbl.io",
  "Draw Something",
  "Words With Friends",
  "Heads Up!",
  "Exploding Kittens",
  "Minesweeper",
  "Sudoku",
  "Pictionary",
  "Ludo King",
  "Monopoly",
  "Catan",
  "Carcassonne",
  "Risk",
  "Scrabble",
  "Checkers",
  "Solitaire",
  "Mahjong",
  "Yahtzee",
  "Dominos",
  "Go",
  "Backgammon"
];

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGames = gamesList.filter((game) =>
    game.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">A Gamer's Gyat</h1>
        <p className="text-gray-400 mt-2">Discover and play your favorite games, all in one place!</p>
      </div>

      <div className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search for games..."
          className="w-full p-2 text-black rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredGames.map((game, index) => (
          <div key={index} className="bg-gray-800 shadow-lg p-4 rounded-md text-center">
            <h3 className="text-lg font-bold mb-2">{game}</h3>
            <button className="mt-2 w-full bg-blue-600 text-white py-1 px-4 rounded-md hover:bg-blue-700">
              Play Now
            </button>
          </div>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          No games found. Try a different search term!
        </div>
      )}
    </div>
  );
}