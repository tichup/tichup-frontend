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

function getPlayerTichuStats(players, savedRounds) {
  return players.map((player) => {
    const stats = savedRounds.reduce(
      (accumulator, round) => {
        const playerResult = round.playerResults.find((item) => item.playerId === player.id);
        const tichu = playerResult?.tichu ?? "none";

        if (tichu === "none") {
          return accumulator;
        }

        accumulator.totalCalls += 1;

        if (tichu === "large-success") {
          accumulator.largeSuccess += 1;
        } else if (tichu === "large-fail") {
          accumulator.largeFail += 1;
        } else if (tichu === "small-success") {
          accumulator.smallSuccess += 1;
        } else if (tichu === "small-fail") {
          accumulator.smallFail += 1;
        }

        return accumulator;
      },
      {
        largeSuccess: 0,
        largeFail: 0,
        smallSuccess: 0,
        smallFail: 0,
        totalCalls: 0,
      },
    );

    return {
      playerId: player.id,
      playerName: player.name,
      ...stats,
    };
  });
}

function getTeamTichuStats(teams, savedRounds) {
  return teams.map((team) => {
    const stats = savedRounds.reduce(
      (accumulator, round) => {
        const members = round.playerResults.filter((item) => item.teamId === team.id);

        members.forEach((playerResult) => {
          if (playerResult.tichu === "none") {
            return;
          }

          accumulator.totalCalls += 1;

          if (playerResult.tichu === "large-success" || playerResult.tichu === "small-success") {
            accumulator.success += 1;
          }

          if (playerResult.tichu === "large-fail" || playerResult.tichu === "small-fail") {
            accumulator.fail += 1;
          }
        });

        return accumulator;
      },
      {
        success: 0,
        fail: 0,
        totalCalls: 0,
      },
    );

    return {
      teamId: team.id,
      teamName: team.name,
      ...stats,
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

function TichuTeamList({ items }) {
  return (
    <section className="stats-card">
      <h3 className="stats-card-title">팀별 티츄 결과</h3>
      {items.length ? (
        <div className="stats-detail-list">
          {items.map((item) => (
            <article key={item.teamId} className="stats-detail-item">
              <div className="stats-detail-header">
                <strong>{item.teamName}</strong>
                <span>총 {item.totalCalls}회</span>
              </div>
              <div className="stats-badge-row">
                <span className="stats-badge success-badge">성공 {item.success}회</span>
                <span className="stats-badge fail-badge">실패 {item.fail}회</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="result-summary">아직 티츄 선언 기록이 없습니다.</p>
      )}
    </section>
  );
}

function TichuPlayerList({ items }) {
  return (
    <section className="stats-card">
      <h3 className="stats-card-title">플레이어별 티츄 결과</h3>
      {items.length ? (
        <div className="stats-detail-list">
          {items.map((item) => (
            <article key={item.playerId} className="stats-detail-item">
              <div className="stats-detail-header">
                <strong>{item.playerName}</strong>
                <span>총 {item.totalCalls}회</span>
              </div>
              <div className="stats-badge-row">
                <span className="stats-badge success-badge">라지 성공 {item.largeSuccess}회</span>
                <span className="stats-badge fail-badge">라지 실패 {item.largeFail}회</span>
                <span className="stats-badge success-badge">스몰 성공 {item.smallSuccess}회</span>
                <span className="stats-badge fail-badge">스몰 실패 {item.smallFail}회</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="result-summary">아직 티츄 선언 기록이 없습니다.</p>
      )}
    </section>
  );
}

function StatsPanel({ gameConfig, savedRounds, teamTotals }) {
  const playerTotals = getPlayerTotals(gameConfig.players, savedRounds).sort(
    (a, b) => b.totalPoints - a.totalPoints,
  );
  const playerTichuStats = getPlayerTichuStats(gameConfig.players, savedRounds).sort(
    (a, b) => b.totalCalls - a.totalCalls || b.largeSuccess + b.smallSuccess - (a.largeSuccess + a.smallSuccess),
  );
  const teamTichuStats = getTeamTichuStats(gameConfig.teams, savedRounds);
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
          {bestRound ? <span className="stats-summary-meta">라운드 {bestRound.roundId}</span> : null}
        </article>
      </div>

      <div className="stats-grid">
        <StatsBarList title="팀 누적 점수" items={teamTotals} tone="team-tone" />
        <StatsBarList title="플레이어 누적 점수" items={playerTotals} tone="player-tone" />
      </div>

      <div className="stats-grid">
        <TichuTeamList items={teamTichuStats} />
        <TichuPlayerList items={playerTichuStats} />
      </div>
    </section>
  );
}

export default StatsPanel;
