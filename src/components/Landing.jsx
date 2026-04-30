import "../App.css";

function Landing({ onStart }) {
  return (
    <main className="app">
      <h1 className="app-title">Tichup</h1>
      <p className="app-subtitle">Welcome to Tichup!</p>
      <button type="button" className="start-button" onClick={onStart}>
        START
      </button>
    </main>
  );
}

export default Landing;
