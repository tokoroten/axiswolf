import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import OnlineHome from './pages/OnlineHome';
import OnlineGame from './pages/OnlineGame';
import Debug from './pages/Debug';
import { GameProvider } from './contexts/GameContext';

function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <GameProvider>
      <Router basename={basename}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/online" element={<OnlineHome />} />
          <Route path="/online/:roomCode" element={<OnlineGame />} />
          <Route path="/debug" element={<Debug />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;