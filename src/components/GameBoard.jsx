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
  const [toastState, setToastState] = useState({ type: "", messages: [] });
  const [savedRounds, setSavedRounds] = useState([]);
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);

  const playerRanks = useMemo(
    () =>
      gameConfig.players.map((player) => {
        const rankIndex = roundForm.rankings.findIndex((playerId) => String(player.id) === playerId);
        return rankIndex >= 0 ? String(rankIndex + 1) : "";
      }),
    [gameConfig.players, roundForm.rankings],
  );

  const teamTotals = useMemo(
    () =>
      gameConfig.teams.map((team) => {
        const totalPoints = savedRounds.reduce((sum, round) => {
          const teamScore = round.teamScores.find((item) => item.teamId === team.id);
          return sum + (teamScore?.totalPoints ?? 0);
        }, 0);

        return {
          teamId: team.id,
          totalPoints,
        };
      }),
    [gameConfig.teams, savedRounds],
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
    setToastState({ type: "", messages: [] });
  }

  function openRoundModal() {
    resetRoundForm();
    setIsRoundModalOpen(true);
  }

  function closeRoundModal() {
    resetRoundForm();
    setIsRoundModalOpen(false);
  }

  function getRoundCalculation() {
    return calculateRoundScore({
      teams: gameConfig.teams,
      players: gameConfig.players,
      rankings: roundForm.rankings,
      points: roundForm.points,
      tichu: roundForm.tichu,
    });
  }

  function handleSaveRound() {
    const result = getRoundCalculation();

    if (!result.isValid) {
      setToastState({
        type: "error",
        messages: ["입력값을 다시 확인해주세요.", ...result.issues],
      });
      return;
    }

    setSavedRounds((current) => [
      ...current,
      {
        id: current.length + 1,
        rankings: [...roundForm.rankings],
        points: [...roundForm.points],
        tichu: [...roundForm.tichu],
        totalEnteredPoints: result.totalEnteredPoints,
        playerResults: result.playerResults,
        teamScores: result.teamScores,
      },
    ]);

    setRoundForm(initialRoundForm);
    setIsRoundModalOpen(false);
    setToastState({
      type: "success",
      messages: ["라운드를 저장했습니다."],
    });
  }

  function handleResetRoundForm() {
    resetRoundForm();
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
              <div className="score-placeholder">
                누적 점수 {teamTotals.find((item) => item.teamId === team.id)?.totalPoints ?? 0}점
              </div>
            </article>
          ))}
        </div>

        <section className="round-history-section">
          <div className="section-heading">
            <div>
              <p className="panel-eyebrow">History</p>
              <h2 className="round-title">저장된 라운드</h2>
            </div>
          </div>

          {savedRounds.length ? (
            <div className="history-list">
              {savedRounds.map((round) => (
                <article key={round.id} className="history-card">
                  <div className="history-header">
                    <h3 className="block-title">라운드 {round.id}</h3>
                    <span className="history-meta">입력 점수 합계 {round.totalEnteredPoints}점</span>
                  </div>

                  <div className="result-grid">
                    <div className="result-card">
                      <h4 className="history-title">팀 점수</h4>
                      <ul className="preview-list">
                        {round.teamScores.map((teamScore) => (
                          <li key={teamScore.teamId}>
                            {teamScore.teamName}: {teamScore.totalPoints}점
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="result-card">
                      <h4 className="history-title">플레이어 결과</h4>
                      <ul className="preview-list">
                        {round.playerResults.map((playerResult) => (
                          <li key={playerResult.playerId}>
                            {playerResult.playerName}: {playerResult.totalPoints}점
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="result-card">
              <p className="result-summary">아직 저장된 라운드가 없습니다.</p>
            </div>
          )}

          <button type="button" className="add-round-button" onClick={openRoundModal} aria-label="라운드 추가">
            +
          </button>
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

      {isRoundModalOpen ? (
        <div className="modal-backdrop" onClick={closeRoundModal}>
          <section
            className="modal-panel"
            onClick={(event) => event.stopPropagation()}
            aria-modal="true"
            role="dialog"
          >
            <div className="section-heading">
              <div>
                <p className="panel-eyebrow">Round Input</p>
                <h2 className="round-title">새 라운드 입력</h2>
              </div>
              <div className="action-row">
                <button type="button" className="secondary-button" onClick={handleResetRoundForm}>
                  입력 초기화
                </button>
                <button type="button" className="secondary-button" onClick={closeRoundModal}>
                  닫기
                </button>
              </div>
            </div>

            <section className="round-form-section modal-section">
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
            </section>

            <div className="modal-footer">
              <button type="button" className="primary-button" onClick={handleSaveRound}>
                저장
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default GameBoard;
