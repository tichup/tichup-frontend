import { useEffect, useMemo, useState } from "react";
import "../App.css";
import { calculateRoundScore } from "../calculateRoundScore";

const initialRoundForm = {
  rankings: ["", "", "", ""],
  points: ["0", "0", "0", "0"],
  tichu: ["none", "none", "none", "none"],
};

const tichuOptions = [
  { value: "large-success", label: "라지 티츄 성공" },
  { value: "large-fail", label: "라지 티츄 실패" },
  { value: "small-success", label: "스몰 티츄 성공" },
  { value: "small-fail", label: "스몰 티츄 실패" },
];

function getSliderFillPercent(value) {
  const min = -25;
  const max = 100;
  return ((Number(value) - min) / (max - min)) * 100;
}

function GameBoard({ gameConfig, onEditSetup, onResetGame }) {
  const [roundForm, setRoundForm] = useState(initialRoundForm);
  const [calculationResult, setCalculationResult] = useState(null);
  const [toastState, setToastState] = useState({ type: "", messages: [] });

  const playerRanks = useMemo(
    () =>
      gameConfig.players.map((player) => {
        const rankIndex = roundForm.rankings.findIndex((playerId) => String(player.id) === playerId);
        return rankIndex >= 0 ? String(rankIndex + 1) : "";
      }),
    [gameConfig.players, roundForm.rankings],
  );

  function updatePoint(playerIndex, value) {
    setRoundForm((current) => {
      const points = [...current.points];
      points[playerIndex] = value;
      return { ...current, points };
    });
  }

  function updateTichu(playerIndex, value) {
    setRoundForm((current) => {
      const tichu = [...current.tichu];
      tichu[playerIndex] = tichu[playerIndex] === value ? "none" : value;
      return { ...current, tichu };
    });
  }

  function updatePlayerRank(playerIndex, nextRank) {
    setRoundForm((current) => {
      const rankings = current.rankings.map((playerId) =>
        playerId === String(playerIndex) ? "" : playerId,
      );

      if (nextRank !== "") {
        rankings[Number(nextRank) - 1] = String(playerIndex);
      }

      return { ...current, rankings };
    });
  }

  function resetRoundForm() {
    setRoundForm(initialRoundForm);
    setCalculationResult(null);
    setToastState({ type: "", messages: [] });
  }

  function handleCalculateRound() {
    const result = calculateRoundScore({
      teams: gameConfig.teams,
      players: gameConfig.players,
      rankings: roundForm.rankings,
      points: roundForm.points,
      tichu: roundForm.tichu,
    });

    setCalculationResult(result);

    if (result.isValid) {
      setToastState({
        type: "success",
        messages: ["계산이 완료되었습니다."],
      });
    } else {
      setToastState({
        type: "error",
        messages: ["입력값을 다시 확인해주세요.", ...result.issues],
      });
    }
  }

  useEffect(() => {
    if (toastState.messages.length === 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToastState({ type: "", messages: [] });
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [toastState]);

  return (
    <main className="screen">
      {toastState.messages.length ? (
        <div className={`toast-message toast-${toastState.type}`}>
          {toastState.messages.map((message) => (
            <p key={message} className="toast-line">
              {message}
            </p>
          ))}
        </div>
      ) : null}

      <section className="panel board-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">Game Board</p>
            <h1 className="panel-title">이제 라운드 점수를 입력할 준비가 되었습니다.</h1>
            <p className="panel-description">
              이번 단계에서는 라운드 입력 폼을 먼저 붙입니다. 아직 계산 로직은 연결하지 않고,
              어떤 데이터를 받을지 화면에서 안정적으로 정리하는 데 집중합니다.
            </p>
          </div>

          <div className="target-chip">목표 {gameConfig.targetScore}점</div>
        </div>

        <div className="board-grid">
          {gameConfig.teams.map((team) => (
            <article key={team.id} className="team-card">
              <p className="team-label">Team</p>
              <h2 className="team-name">{team.name}</h2>
              <ul className="player-list">
                {team.playerIds.map((playerId) => {
                  const player = gameConfig.players.find((item) => item.id === playerId);
                  return <li key={playerId}>{player?.name}</li>;
                })}
              </ul>
              <div className="score-placeholder">누적 점수 0점</div>
            </article>
          ))}
        </div>

        <section className="round-form-section">
          <div className="section-heading">
            <div>
              <p className="panel-eyebrow">Round Input</p>
              <h2 className="round-title">첫 번째 라운드 입력</h2>
            </div>
            <button type="button" className="secondary-button" onClick={resetRoundForm}>
              입력 초기화
            </button>
          </div>

          <div className="round-grid">
            <section className="round-block round-block-full">
              <h3 className="block-title">플레이어별 입력</h3>
              <div className="player-input-list">
                {gameConfig.players.map((player, playerIndex) => (
                  <article key={player.id} className="player-input-card">
                    <div className="player-input-header">
                      <strong>{player.name}</strong>
                      <span>{gameConfig.teams[player.teamId].name}</span>
                    </div>

                    <div className="field-grid compact-grid">
                      <div className="field">
                        <span>순위</span>
                        <div className="rank-toggle-group" role="radiogroup" aria-label={`${player.name} 순위 선택`}>
                          {["1", "2", "3", "4"].map((rankValue) => (
                            <button
                              key={rankValue}
                              type="button"
                              role="radio"
                              aria-checked={playerRanks[playerIndex] === rankValue}
                              className={`rank-toggle-button ${
                                playerRanks[playerIndex] === rankValue ? "active" : ""
                              }`}
                              onClick={() =>
                                updatePlayerRank(
                                  playerIndex,
                                  playerRanks[playerIndex] === rankValue ? "" : rankValue,
                                )
                              }
                            >
                              {rankValue}등
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="field">
                        <span>획득 점수</span>
                        <div className="score-slider-group">
                          <div className="score-slider-header">
                            <strong className="score-value">{roundForm.points[playerIndex]}점</strong>
                          </div>
                          <input
                            className="score-slider"
                            type="range"
                            min="-25"
                            max="100"
                            step="5"
                            value={roundForm.points[playerIndex]}
                            onChange={(event) => updatePoint(playerIndex, event.target.value)}
                            style={{
                              "--fill-percent": `${getSliderFillPercent(roundForm.points[playerIndex])}%`,
                            }}
                          />
                          <div className="score-slider-scale">
                            <span>-25</span>
                            <span>100</span>
                          </div>
                        </div>
                      </label>

                      <div className="field field-full">
                        <span>티츄 선언</span>
                        <div className="tichu-toggle-grid">
                          {tichuOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`tichu-toggle-button ${
                                roundForm.tichu[playerIndex] === option.value ? "active" : ""
                              }`}
                              onClick={() => updateTichu(playerIndex, option.value)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="round-result-section">
          <div className="section-heading">
            <div>
              <p className="panel-eyebrow">Calculation</p>
              <h2 className="round-title">라운드 계산 결과</h2>
            </div>
            <button type="button" className="primary-button" onClick={handleCalculateRound}>
              라운드 계산
            </button>
          </div>

          {calculationResult ? (
            <div className="result-stack">
              <div className="result-grid">
                <div className="result-card">
                  <h3 className="block-title">팀별 점수</h3>
                  <ul className="preview-list">
                    {calculationResult.teamScores.map((teamScore) => (
                      <li key={teamScore.teamId}>
                        {teamScore.teamName}: 기본 {teamScore.basePoints}점 / 티츄{" "}
                        {teamScore.tichuPoints}점 / 합계 {teamScore.totalPoints}점
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="result-card">
                  <h3 className="block-title">플레이어별 반영 결과</h3>
                  <ul className="preview-list">
                    {calculationResult.playerResults.map((playerResult) => (
                      <li key={playerResult.playerId}>
                        {playerResult.playerName}: 순위 {playerResult.rank ?? "-"} / 기본{" "}
                        {playerResult.basePoints}점 / 티츄 {playerResult.tichuDelta}점 / 합계{" "}
                        {playerResult.totalPoints}점
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="result-card">
                <h3 className="block-title">입력 점수 합계</h3>
                <p className="result-summary">
                  현재 플레이어별 획득 점수 총합은 {calculationResult.totalEnteredPoints}점입니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="result-card">
              <p className="result-summary">
                `라운드 계산` 버튼을 누르면 팀별 점수와 플레이어별 반영 결과가 여기에 표시됩니다.
              </p>
            </div>
          )}
        </section>

        <div className="button-row">
          <button type="button" className="secondary-button" onClick={onEditSetup}>
            설정 수정
          </button>
          <button type="button" className="secondary-button danger-button" onClick={onResetGame}>
            처음으로
          </button>
        </div>
      </section>
    </main>
  );
}

export default GameBoard;
