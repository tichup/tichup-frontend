const TICHU_SCORE_MAP = {
  none: 0,
  "small-success": 100,
  "small-fail": -100,
  "large-success": 200,
  "large-fail": -200,
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRankByPlayerId(rankings, playerId) {
  const rankIndex = rankings.findIndex((value) => String(value) === String(playerId));
  return rankIndex >= 0 ? rankIndex + 1 : null;
}

function getRankIssues(rankings, players) {
  const issues = [];
  const selected = rankings.filter((value) => value !== "");

  if (selected.length !== players.length) {
    issues.push("모든 플레이어의 순위를 선택해야 합니다.");
  }

  const uniquePlayers = new Set(selected);
  if (uniquePlayers.size !== selected.length) {
    issues.push("같은 플레이어가 여러 순위에 중복 선택되어 있습니다.");
  }

  return issues;
}

export function calculateRoundScore({ teams, players, rankings, points, tichu }) {
  const issues = getRankIssues(rankings, players);

  const playerResults = players.map((player, index) => {
    const basePoints = toNumber(points[index]);
    const tichuKey = tichu[index] ?? "none";
    const tichuDelta = TICHU_SCORE_MAP[tichuKey] ?? 0;

    return {
      playerId: player.id,
      playerName: player.name,
      teamId: player.teamId,
      teamName: teams.find((team) => team.id === player.teamId)?.name ?? "",
      rank: getRankByPlayerId(rankings, player.id),
      basePoints,
      tichu: tichuKey,
      tichuDelta,
      totalPoints: basePoints + tichuDelta,
    };
  });

  const teamScores = teams.map((team) => {
    const members = playerResults.filter((player) => player.teamId === team.id);
    const basePoints = members.reduce((sum, player) => sum + player.basePoints, 0);
    const tichuPoints = members.reduce((sum, player) => sum + player.tichuDelta, 0);

    return {
      teamId: team.id,
      teamName: team.name,
      basePoints,
      tichuPoints,
      totalPoints: basePoints + tichuPoints,
    };
  });

  const totalEnteredPoints = playerResults.reduce((sum, player) => sum + player.basePoints, 0);

  if (totalEnteredPoints !== 100) {
    issues.push("현재 플레이어별 획득 점수 합계가 100점이 아닙니다.");
  }

  return {
    isValid: issues.length === 0,
    issues,
    totalEnteredPoints,
    playerResults,
    teamScores,
  };
}

export { TICHU_SCORE_MAP };
