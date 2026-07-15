import React from 'react';
import { CharacterStage } from './CharacterStage';

interface AdvisorPortraitProps {
  id: string;
  fallbackSpriteId?: string;
  width: number;
  height: number;
  glow?: boolean;
  className?: string;
}

export const AdvisorPortrait: React.FC<AdvisorPortraitProps> = ({
  id,
  fallbackSpriteId = 'case_ledger',
  width,
  height,
  glow = true,
  className,
}) => {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [id]);

  if (failed) {
    return <CharacterStage spriteId={fallbackSpriteId} width={width} height={height} glow={glow} />;
  }

  return (
    <img
      className={className}
      src={`/assets/characters/${id}.png`}
      alt=""
      aria-hidden
      draggable={false}
      onError={() => setFailed(true)}
      style={{
        display: 'block',
        width,
        height,
        objectFit: 'contain',
        filter: glow ? 'drop-shadow(0 14px 24px rgba(0,0,0,0.62))' : undefined,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  );
};
