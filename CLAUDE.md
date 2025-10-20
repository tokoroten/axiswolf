# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Language

**Always respond in Japanese (日本語)** when interacting with the user. All explanations, status updates, and responses should be in Japanese unless explicitly requested otherwise.

## Project Overview

"Axis Wolf (アクシスウルフ)" is a social deduction game combining physical cards with a web-based system. Players place cards on a 4-quadrant axis to identify the werewolf who sees slightly different axes than other players.

## Development Commands

### Frontend (React + TypeScript + Vite)
```bash
cd frontend
npm install
npm run dev       # Development server at http://localhost:5173
npm run build     # Production build with TypeScript type checking
npm run lint      # ESLint
```

**Critical**: Always run `npm run build` after making changes to verify TypeScript compilation succeeds. The build includes strict type checking (`verbatimModuleSyntax` is enabled).

**Note**: Vite development server runs on `http://localhost:5173` by default.

### Backend (FastAPI + WebSocket)
```bash
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
# API at http://localhost:8000
# API docs at http://localhost:8000/docs
```

## Architecture

### Frontend Architecture
- **State Management**: React Context API ([GameContext.tsx](frontend/src/contexts/GameContext.tsx))
- **Routing**: React Router (Home, OnlineHome, OnlineGame pages)
- **Styling**: Tailwind CSS v4 with native modules (requires platform-specific packages on Windows)
- **Real-time Communication**: WebSocket client with auto-reconnect (max 5 retries)
- **Type Safety**: TypeScript with `verbatimModuleSyntax` enabled - **always use `import type` for type-only imports**

### Backend Architecture
- **Storage**: In-memory dictionaries (data is lost on server restart)
  - `rooms`: Room state and configuration
  - `players`: Player information and connection status
  - `cards`: Card placements on board
  - `votes`: Player votes
  - `player_tokens`: Token-based authentication
  - `chat_messages`: Chat history per room
- **WebSocket**: Real-time synchronization using ConnectionManager
  - Tracks player connections with `player_connections` and `websocket_to_player` mappings
  - Broadcasts game events (phase changes, card placements, votes, chat messages)
  - Handles reconnection with deduplication (removes old connections from same player_id)
- **Game Logic**: Server-authoritative with deterministic RNG
  - Uses seed-based random generation for fairness
  - Werewolf selection: `Random(seed).randint(0, num_players - 1)`
  - Hand generation: Deterministic card distribution using `generate_all_hands()`
  - Axis generation: 230+ axis definitions in [axis_data.py](backend/axis_data.py)

### Deterministic Game State
All random elements (werewolf selection, hand cards, axes) are determined server-side using a seed value. This ensures:
- Fairness (no client-side manipulation)
- Reproducibility (same seed = same game state)
- Proper synchronization across all players

**Key Implementation**: When a round starts:
1. Server generates seed and saves `wolf_slot` and `round_num_players` in room data
2. Axis pairs generated with `generate_axis_pair()` and `generate_wolf_axis_pair()`
3. All player hands generated with `generate_all_hands(round_seed, num_players, hand_size, themes)`
4. Each client fetches their hand via `/api/rooms/{room_code}/hand`

### Theme System
- 8 themes: food, daily, entertainment, animal, place, vehicle, sport, chaos (all themes mixed)
- Theme selection affects:
  - Card pool filtering (via `get_filtered_card_pool()`)
  - Axis selection (only axes compatible with selected theme)
- Multiple themes can be selected; server picks one theme per round using seed-based selection

### Authentication
- Token-based system (optional, controlled by `REQUIRE_TOKEN_AUTH` env var)
- Tokens issued on room creation/join, stored in `player_tokens` dict
- Tokens stored in localStorage on client: `online_player_token`
- Validated via `verify_player_token()` dependency on protected endpoints
- WebSocket authentication via query parameter: `?player_id={id}&token={token}`

### Phase Flow
1. **lobby**: Room setup, player joins, theme selection
2. **placement**: Players place cards on 4-quadrant board (3 cards each)
3. **voting**: Players vote for suspected werewolf
4. **results**: Score calculation, reveal werewolf and axes

**Important**: Score calculation happens during phase transition to `results` in `/api/rooms/{room_code}/phase`. Results are cached in room data and retrieved via `/api/rooms/{room_code}/calculate_results`.

## Key Technical Constraints

### TypeScript
- `verbatimModuleSyntax` is enabled - **always use `import type` for types**:
  ```typescript
  // Correct
  import type { AxisPayload } from '../types';

  // Wrong - will cause compilation error
  import { AxisPayload } from '../types';
  ```

### Tailwind CSS v4
- Uses native modules (Rust-based)
- Windows requires: `@tailwindcss/oxide-win32-x64-msvc`, `@rollup/rollup-win32-x64-msvc`
- Configuration in `@import "tailwindcss"` in CSS files

### WebSocket Handling
- Single connection per player (old connections auto-closed on reconnect)
- Connection tracking via `player_id` in ConnectionManager
- Lobby phase: players auto-removed on disconnect
- Game phase: players marked offline but remain in game

### Chat System
- **Real-time messaging**: WebSocket-based chat with instant broadcast to all room members
- **Message persistence**: Chat history stored in `chat_messages` dict (per room)
- **History loading**: On initial connection (`load_history=true`), past messages are sent to new client
- **Duplicate prevention**: Reconnections use `load_history=false` to avoid duplicate messages
- **Message format**: `{"type": "chat", "player_id": "...", "player_name": "...", "message": "...", "timestamp": "..."}`

### Player Management in Lobby
When a player disconnects during lobby phase:
1. **Automatic removal**: Player is immediately removed from `players[room_code]` list
2. **Token cleanup**: Player's token deleted from `player_tokens`
3. **Host transfer**: If disconnected player was host, first remaining player becomes new host
4. **Broadcast notification**: `player_removed` event sent with `reason: "offline_in_lobby"`
5. **Room cleanup**: If last player leaves, entire room (including cards, votes, chat) is deleted
6. **Race condition protection**: Uses `room_locks[room_code]` to prevent concurrent modifications

**Important**: During gameplay (non-lobby phases), players are only marked offline but NOT removed, allowing them to reconnect.

### Race Condition Prevention
- Room operations use `room_locks` (asyncio.Lock per room)
- Critical sections: player removal, room deletion
- Always acquire lock before modifying player list or room state

## Common Patterns

### Adding New API Endpoint
1. Define Pydantic request/response models
2. Implement endpoint with `@app.post/get` decorator
3. Add `player_id: str = Depends(verify_player_token)` for authenticated endpoints
4. Update `last_activity_at` timestamp for room persistence
5. Broadcast WebSocket event if state change affects other players
6. Add client method to [api.ts](frontend/src/lib/api.ts) with auth headers

### Broadcasting Game Events
```python
await manager.broadcast(room_code, {
    "type": "event_name",
    "data": {...}
})
```

Common event types: `phase_changed`, `card_placed`, `vote_submitted`, `player_joined`, `player_left`, `player_online`, `player_offline`, `round_started`, `chat`

### State Restoration on Reconnect
- Client stores: `online_room_code`, `online_player_id`, `online_player_name`, `online_player_token` in localStorage
- On reconnect: fetch room state via `/api/rooms/{room_code}`, establish new WebSocket with `load_history=false` to prevent duplicate messages
- WebSocket automatically closes old connection from same `player_id`

## Deployment

**Platform**: Render (single service for both frontend and backend)

Build process (see [backend/build.sh](backend/build.sh)):
1. Install frontend dependencies: `npm ci`
2. Build frontend with empty API base: `VITE_API_BASE='' VITE_WS_BASE='' npm run build`
3. Copy `frontend/dist/*` to `backend/static/`
4. Install Python dependencies: `pip install -r requirements.txt`
5. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Important**: Production uses same-origin for API/WS (empty `VITE_API_BASE` triggers relative path `/api`). FastAPI serves static files and provides SPA fallback at root path.

## Known Limitations

1. **Data Persistence**: All data is in-memory. Server restart = data loss. Old rooms cleaned up every 24 hours (14+ days inactive).
2. **Security**: Basic token auth. No rate limiting, HTTPS enforcement, or advanced validation.
3. **Scalability**: Single-server architecture. WebSocket state not shared across instances.
4. **Player Slot Management**: Slots assigned sequentially (0, 1, 2...). If player leaves, slot is NOT reused (can cause gaps).

## Troubleshooting

### "Module is not defined" TypeScript error
- Check you're using `import type` for type-only imports
- Ensure `verbatimModuleSyntax: true` is respected

### WebSocket connection fails
- Verify backend is running on port 8000
- Check CORS settings in [main.py](backend/main.py) - `ALLOWED_ORIGINS` env var
- In production, ensure WebSocket upgrade is allowed by reverse proxy

### Tailwind CSS build errors on Windows
- Ensure optional dependencies installed: `npm install -D @tailwindcss/oxide-win32-x64-msvc @rollup/rollup-win32-x64-msvc`
- Clear node_modules and reinstall if needed

### Player sees duplicate in room
- Check for multiple WebSocket connections from same `player_id`
- ConnectionManager should auto-close old connections
- Verify LocalStorage has correct `online_player_id`

### Score calculation incorrect
- Verify `wolf_slot` is saved in room data during placement phase
- Check `round_num_players` matches actual player count at round start
- Score calculation happens in `/phase` endpoint when transitioning to `results`
- Results are cached; subsequent calls to `/calculate_results` return cached data

## File Structure

```
yonshogen/
├── frontend/
│   ├── src/
│   │   ├── pages/           # OnlineHome, OnlineGame, Home, Game, Debug
│   │   ├── components/      # GameBoard, ChatPanel, PlayerAvatar, etc.
│   │   ├── contexts/        # GameContext for online game state
│   │   ├── data/            # Card pools, theme definitions
│   │   ├── lib/api.ts       # API client with auth
│   │   ├── types.ts         # Shared TypeScript types
│   │   └── utils/           # Helper functions
│   ├── tsconfig.app.json    # Strict TS config with verbatimModuleSyntax
│   └── package.json         # React 19, Vite 6, Tailwind CSS v4
├── backend/
│   ├── main.py              # FastAPI app, WebSocket, game logic
│   ├── axis_data.py         # 230+ axis definitions, generation logic
│   ├── requirements.txt     # FastAPI, uvicorn, websockets, pydantic
│   └── build.sh             # Render build script
└── docs/TODO.md             # Development progress tracker
```

## Progress Tracking

See [docs/TODO.md](docs/TODO.md) for current development status, completed features, and upcoming tasks.
