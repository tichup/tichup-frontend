import "../App.css";

function GameBoard({ gameConfig, onEditSetup, onResetGame }) {
  return (
    <main className="screen">
      <section className="panel board-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">Game Board</p>
            <h1 className="panel-title">이제 라운드 점수를 쌓아갈 준비가 되었습니다.</h1>
            <p className="panel-description">
              다음 단계에서는 여기 아래에 라운드 입력 폼과 누적 점수판을 붙이면 됩니다.
              지금은 설정한 팀과 플레이어 구성이 제대로 넘어오는지 먼저 확인할 수 있습니다.
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

        <section className="round-placeholder">
          <p className="panel-eyebrow">Next Step</p>
          <h2 className="round-title">다음에는 여기서 라운드 결과를 입력합니다.</h2>
          <p className="round-description">
            1등부터 4등까지 순위를 고르고, 플레이어별 획득 점수와 티츄 선언 정보를 입력하면
            누적 점수판에 반영되도록 만들면 됩니다.
          </p>
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
