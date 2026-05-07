import "../App.css";

function getMaxAbsValue(items) {
  return items.reduce((max, item) => Math.max(max, Math.abs(item.totalPoints)), 0) || 1;
}

function getPlayerTotals(players, savedRounds) {
  return players.map((player) => {
    const totalPoints = savedRounds.reduce((sum, round) => {
      const playerResult = round.playerResults.find((item) => item.playerId === player.id);
      return sum + (playerResult?.totalPoints ?? 0);
    }, 0);

    return {
      playerId: player.id,
      playerName: player.name,
      teamId: player.teamId,
      totalPoints,
    };
  });
}

function getBestRound(savedRounds) {
  let bestRound = null;

  savedRounds.forEach((round) => {
    round.teamScores.forEach((teamScore) => {
      if (!bestRound || teamScore.totalPoints > bestRound.totalPoints) {
        bestRound = {
          roundId: round.id,
          teamId: teamScore.teamId,
          teamName: teamScore.teamName,
          totalPoints: teamScore.totalPoints,
        };
      }
    });
  });

  return bestRound;
}

function StatsBarList({ title, items, tone }) {
  const maxAbsValue = getMaxAbsValue(items);

  return (
    <section className="stats-card">
      <h3 className="stats-card-title">{title}</h3>
      {items.length ? (
        <div className="stats-bar-list">
          {items.map((item) => (
            <div key={item.playerId ?? item.teamId} className="stats-bar-item">
              <div className="stats-bar-header">
                <strong>{item.playerName ?? item.teamName}</strong>
                <span>{item.totalPoints}점</span>
              </div>
              <div className="stats-bar-track">
                <div
                  className={`stats-bar-fill ${tone}`}
                  style={{
                    width: `${Math.max((Math.abs(item.totalPoints) / maxAbsValue) * 100, 6)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="result-summary">아직 통계를 낼 라운드가 없습니다.</p>
      )}
    </section>
  );
}

function StatsPanel({ gameConfig, savedRounds, teamTotals }) {
  const playerTotals = getPlayerTotals(gameConfig.players, savedRounds).sort(
    (a, b) => b.totalPoints - a.totalPoints,
  );
  const bestRound = getBestRound(savedRounds);

  return (
    <section className="stats-section">
      <div className="stats-summary-grid">
        <article className="stats-summary-card">
          <p className="stats-summary-label">총 라운드</p>
          <strong className="stats-summary-value">{savedRounds.length}</strong>
        </article>

        <article className="stats-summary-card">
          <p className="stats-summary-label">목표 점수</p>
          <strong className="stats-summary-value">{gameConfig.targetScore}점</strong>
        </article>

        <article className="stats-summary-card">
          <p className="stats-summary-label">최고 라운드 점수</p>
          <strong className="stats-summary-value">
            {bestRound ? `${bestRound.teamName} ${bestRound.totalPoints}점` : "-"}
          </strong>
          {bestRound ? (
            <span className="stats-summary-meta">라운드 {bestRound.roundId}</span>
          ) : null}
        </article>
      </div>

      <div className="stats-grid">
        <StatsBarList title="팀 누적 점수" items={teamTotals} tone="team-tone" />
        <StatsBarList title="플레이어 누적 점수" items={playerTotals} tone="player-tone" />
      </div>
    </section>
  );
}

export default StatsPanel;
