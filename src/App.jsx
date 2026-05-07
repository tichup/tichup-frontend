import { useEffect, useState } from "react";
import Landing from "./components/Landing";
import GameSetup from "./components/GameSetup";
import GameBoard from "./components/GameBoard";

const APP_STORAGE_KEY = "tichup.app-state.v1";

const initialGameConfig = {
  targetScore: 1000,
  teams: [
    { id: 0, name: "팀 1", playerIds: [0, 1] },
    { id: 1, name: "팀 2", playerIds: [2, 3] },
  ],
  players: [
    { id: 0, name: "플레이어 1", teamId: 0 },
    { id: 1, name: "플레이어 2", teamId: 0 },
    { id: 2, name: "플레이어 3", teamId: 1 },
    { id: 3, name: "플레이어 4", teamId: 1 },
  ],
};

function getInitialAppState() {
  if (typeof window === "undefined") {
    return {
      screen: "landing",
      gameConfig: initialGameConfig,
    };
  }

  try {
    const stored = window.localStorage.getItem(APP_STORAGE_KEY);
    if (!stored) {
      return {
        screen: "landing",
        gameConfig: initialGameConfig,
      };
    }

    const parsed = JSON.parse(stored);
    const nextScreen =
      parsed?.screen === "landing" || parsed?.screen === "setup" || parsed?.screen === "game"
        ? parsed.screen
        : "landing";

    return {
      screen: nextScreen,
      gameConfig: parsed?.gameConfig ?? initialGameConfig,
    };
  } catch {
    return {
      screen: "landing",
      gameConfig: initialGameConfig,
    };
  }
}

function App() {
  const [appState, setAppState] = useState(getInitialAppState);

  useEffect(() => {
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  function setScreen(nextScreen) {
    setAppState((current) => ({
      ...current,
      screen: nextScreen,
    }));
  }

  function setGameConfig(nextConfig) {
    setAppState((current) => ({
      ...current,
      gameConfig: nextConfig,
    }));
  }

  if (appState.screen === "landing") {
    return <Landing onStart={() => setScreen("setup")} />;
  }

  if (appState.screen === "setup") {
    return (
      <GameSetup
        initialConfig={appState.gameConfig}
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
      gameConfig={appState.gameConfig}
      onEditSetup={() => setScreen("setup")}
      onResetGame={() => {
        window.localStorage.removeItem(APP_STORAGE_KEY);
        window.localStorage.removeItem("tichup.rounds.v1");
        window.localStorage.removeItem("tichup.active-tab.v1");

        setAppState({
          screen: "landing",
          gameConfig: initialGameConfig,
        });
      }}
    />
  );
}

export default App;
