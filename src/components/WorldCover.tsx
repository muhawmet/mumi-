import React from 'react';
import { worldCoverUrl } from './worldCovers';

interface WorldCoverProps {
  worldId: string;
  fallback: React.ReactNode;
  height?: number;
}

/** Kapak webp'i varsa gösterir, yoksa fallback'e düşer — PresetPlate deseni (kademeli dolum). */
export const WorldCover: React.FC<WorldCoverProps> = ({ worldId, fallback, height = 64 }) => {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => { setFailed(false); }, [worldId]);
  if (failed) return <>{fallback}</>;
  return (
    <img
      src={worldCoverUrl(worldId)}
      alt=""
      aria-hidden
      draggable={false}
      onError={() => setFailed(true)}
      style={{ display: 'block', width: '100%', height, objectFit: 'cover', borderRadius: 4, pointerEvents: 'none', userSelect: 'none' }}
    />
  );
};
