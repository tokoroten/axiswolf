import type { Player } from '../lib/api';
import { getPlayerColorStyle } from '../utils/playerColors';

interface PlayerAvatarProps {
  player: Player;
  size?: 'small' | 'medium' | 'large';
  showOnlineIndicator?: boolean;
}

export default function PlayerAvatar({
  player,
  size = 'medium',
  showOnlineIndicator = true
}: PlayerAvatarProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-12 h-12',
  };

  const indicatorSizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-2.5 h-2.5',
    large: 'w-3.5 h-3.5',
  };

  const borderClasses = {
    small: 'border',
    medium: 'border-2',
    large: 'border-2',
  };

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} ${borderClasses[size]} rounded-full border-white flex-shrink-0`}
        style={{ backgroundColor: getPlayerColorStyle(player.player_slot) }}
      ></div>
      {showOnlineIndicator && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${indicatorSizeClasses[size]} rounded-full border ${
            size === 'large' ? 'border-2' : 'border'
          } border-gray-700 ${
            player.is_online ? 'bg-green-400' : 'bg-gray-500'
          }`}
          title={player.is_online ? 'オンライン' : 'オフライン'}
        ></div>
      )}
    </div>
  );
}
