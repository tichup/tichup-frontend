import { useState } from "react";
import "../App.css";

function GameSetup({ initialConfig, onBack, onStartGame }) {
  const [form, setForm] = useState(() => ({
    targetScore: initialConfig.targetScore,
    teamNames: initialConfig.teams.map((team) => team.name),
    playerNames: initialConfig.players.map((player) => player.name),
  }));

  function updateTeamName(teamIndex, value) {
    setForm((current) => {
      const teamNames = [...current.teamNames];
      teamNames[teamIndex] = value;
      return { ...current, teamNames };
    });
  }

  function updatePlayerName(playerIndex, value) {
    setForm((current) => {
      const playerNames = [...current.playerNames];
      playerNames[playerIndex] = value;
      return { ...current, playerNames };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    onStartGame({
      targetScore: form.targetScore > 0 ? form.targetScore : 1000,
      teams: [
        { id: 0, name: form.teamNames[0].trim() || "팀 1", playerIds: [0, 1] },
        { id: 1, name: form.teamNames[1].trim() || "팀 2", playerIds: [2, 3] },
      ],
      players: [
        { id: 0, name: form.playerNames[0].trim() || "플레이어 1", teamId: 0 },
        { id: 1, name: form.playerNames[1].trim() || "플레이어 2", teamId: 0 },
        { id: 2, name: form.playerNames[2].trim() || "플레이어 3", teamId: 1 },
        { id: 3, name: form.playerNames[3].trim() || "플레이어 4", teamId: 1 },
      ],
    });
  }

  return (
    <main className="screen">
      <section className="panel setup-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">Game Setup</p>
            <h1 className="panel-title">게임 시작 전 팀과 플레이어를 설정하세요.</h1>
            <p className="panel-description">
              첫 단계에서는 목표 점수, 팀 이름, 플레이어 이름만 입력합니다. 팀 배정은 각 팀당
              두 명으로 고정해두고 다음 단계에서 라운드 결과를 입력하게 됩니다.
            </p>
          </div>
        </div>

        <form className="setup-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>목표 점수</span>
            <input
              type="number"
              min="1"
              value={form.targetScore}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  targetScore: event.target.valueAsNumber || 0,
                }))
              }
            />
          </label>

          <div className="setup-grid">
            <section className="team-block">
              <label className="field">
                <span>팀 1 이름</span>
                <input
                  value={form.teamNames[0]}
                  onChange={(event) => updateTeamName(0, event.target.value)}
                />
              </label>

              <label className="field">
                <span>팀 1 플레이어 1</span>
                <input
                  value={form.playerNames[0]}
                  onChange={(event) => updatePlayerName(0, event.target.value)}
                />
              </label>

              <label className="field">
                <span>팀 1 플레이어 2</span>
                <input
                  value={form.playerNames[1]}
                  onChange={(event) => updatePlayerName(1, event.target.value)}
                />
              </label>
            </section>

            <section className="team-block">
              <label className="field">
                <span>팀 2 이름</span>
                <input
                  value={form.teamNames[1]}
                  onChange={(event) => updateTeamName(1, event.target.value)}
                />
              </label>

              <label className="field">
                <span>팀 2 플레이어 1</span>
                <input
                  value={form.playerNames[2]}
                  onChange={(event) => updatePlayerName(2, event.target.value)}
                />
              </label>

              <label className="field">
                <span>팀 2 플레이어 2</span>
                <input
                  value={form.playerNames[3]}
                  onChange={(event) => updatePlayerName(3, event.target.value)}
                />
              </label>
            </section>
          </div>

          <div className="button-row">
            <button type="button" className="secondary-button" onClick={onBack}>
              뒤로
            </button>
            <button type="submit" className="primary-button">
              게임 시작
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default GameSetup;
