import { useState } from "react"
import Landing from "./components/Landing"
import RoundCalculator from "./components/RoundCalculator"

function App() {
  const [started, setStarted] = useState(false)
  return started ? (
    <RoundCalculator />
  ) : (
    <Landing onStart={() => setStarted(true)} />
  )
}

export default App
