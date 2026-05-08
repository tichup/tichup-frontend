import "../App.css";

function Landing({ onStart }) {
  return (
    <main className="app">
      <h1 className="app-title">Tichup</h1>
      <p className="app-subtitle">티츄 게임 점수를 차곡차곡 기록해보세요.</p>
      <button type="button" className="start-button" onClick={onStart}>
        START
      </button>
    </main>
  );
}

export default Landing;
