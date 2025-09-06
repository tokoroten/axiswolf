import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Host from './pages/Host';
import { GameProvider } from './contexts/GameContext';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/host" element={<Host />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;