import React from 'react';
import { PHASE0_VIDEO } from '../data/presets';
import { WorldIdentityPlate } from './WorldIdentityPlate';

export const PRESET_PLATE_FILES = PHASE0_VIDEO.map((p) => `${p.id}.webp`);

/* Phase 0 is the FIRST screen Mami sees, and every card on it wore the same
   sea-sunset gradient — the exact complaint that got the world plates rebuilt,
   still living one room over. The webp contract (/assets3d/presets/) is real but
   empty, so every card fell through to that one shared fallback.
   A preset's whole job is to LOCK a world. So the card previews the world it
   locks: the same procedural identity plate the recipe wall already paints, keyed
   by the preset's own selectedWorldId. Whiteboard reads white; noir reads noir.
   When a hand-made webp lands it still wins — the plate is the floor, not a ceiling. */
const presetWorldId = (presetId: string): string | undefined =>
  PHASE0_VIDEO.find((p) => p.id === presetId)?.sets?.selectedWorldId;

interface PresetPlateProps {
  presetId: string;
  /** Last resort: the preset has no world (or the plate cannot paint — jsdom). */
  fallback: React.ReactNode;
  height?: number;
}

export const PresetPlate: React.FC<PresetPlateProps> = ({ presetId, fallback, height = 96 }) => {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => { setFailed(false); }, [presetId]);

  if (failed) {
    const worldId = presetWorldId(presetId);
    if (worldId) return <WorldIdentityPlate worldId={worldId} height={height} radius={6} />;
    return <>{fallback}</>;
  }

  return (
    <img
      src={`/assets3d/presets/${presetId}.webp`}
      alt=""
      aria-hidden
      draggable={false}
      onError={() => setFailed(true)}
      style={{ display: 'block', width: '100%', height, objectFit: 'cover', borderRadius: 6, pointerEvents: 'none', userSelect: 'none' }}
    />
  );
};
