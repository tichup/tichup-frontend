import { useState } from "react";
import Landing from "./components/Landing";
import GameSetup from "./components/GameSetup";
import GameBoard from "./components/GameBoard";

const initialGameConfig = {
  targetScore: 1000,
  teams: [
    { id: 0, name: "청룡 팀", playerIds: [0, 1] },
    { id: 1, name: "백호 팀", playerIds: [2, 3] },
  ],
  players: [
    { id: 0, name: "플레이어 1", teamId: 0 },
    { id: 1, name: "플레이어 2", teamId: 0 },
    { id: 2, name: "플레이어 3", teamId: 1 },
    { id: 3, name: "플레이어 4", teamId: 1 },
  ],
};

function App() {
  const [screen, setScreen] = useState("landing");
  const [gameConfig, setGameConfig] = useState(initialGameConfig);

  if (screen === "landing") {
    return <Landing onStart={() => setScreen("setup")} />;
  }

  if (screen === "setup") {
    return (
      <GameSetup
        initialConfig={gameConfig}
        onBack={() => setScreen("landing")}
        onStartGame={(nextConfig) => {
          setGameConfig(nextConfig);
          setScreen("game");
        }}
      />
    );
  }

  return (
    <GameBoard
      gameConfig={gameConfig}
      onEditSetup={() => setScreen("setup")}
      onResetGame={() => {
        setGameConfig(initialGameConfig);
        setScreen("landing");
      }}
    />
  );
}

export default App;
