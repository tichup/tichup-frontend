import "../App.css";

function Landing({ onStart }) {
  return (
    <main className="app">
      <h1 className="app-title">Tichup</h1>
      <p className="app-subtitle">팀을 설정하고 라운드 점수를 차근차근 기록해보세요.</p>
      <button type="button" className="start-button" onClick={onStart}>
        START
      </button>
    </main>
  );
}

export default Landing;
