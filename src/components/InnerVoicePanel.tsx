import React from 'react';
import type { InnerVoiceVerdict } from './innerVoices';
import { AdvisorPortrait } from './AdvisorPortrait';
import { FALLBACK_PORTRAIT, TONE_COLOR, TONE_LABEL, VOICE_PORTRAIT } from './ThoughtBubble/voicePortraits';

interface InnerVoicePanelProps {
  title?: string;
  subtitle?: string;
  voices: InnerVoiceVerdict[];
  compact?: boolean;
}

export const InnerVoicePanel: React.FC<InnerVoicePanelProps> = ({
  title = 'THOUGHT CABINET',
  subtitle = 'ACTIVE THOUGHTS',
  voices,
  compact = false,
}) => (
  <section className="inner-voice-panel" aria-label={title}>
    <header className="inner-voice-head">
      <div>
        <div className="inner-voice-title">{title}</div>
        <div className="inner-voice-subtitle">{subtitle}</div>
      </div>
      <span className="inner-voice-count">{voices.length}</span>
    </header>
    <div className={compact ? 'inner-voice-list compact' : 'inner-voice-list'}>
      {voices.map((voice) => {
        const color = TONE_COLOR[voice.tone];
        const portrait = VOICE_PORTRAIT[voice.voice] || FALLBACK_PORTRAIT;
        return (
          <article key={`${voice.voice}-${voice.title}-${voice.evidence}`} className="inner-voice-card" style={{ borderColor: `${color}55` }}>
            <div className="inner-voice-portrait">
              <AdvisorPortrait id={portrait.id} fallbackSpriteId={portrait.fallback} width={compact ? 44 : 52} height={compact ? 44 : 52} />
            </div>
            <div className="inner-voice-copy">
              <div className="inner-voice-row">
                <span className="inner-voice-name" style={{ color }}>{voice.voice}</span>
                <span className="inner-voice-tone" style={{ color, background: `${color}18` }}>{TONE_LABEL[voice.tone]}</span>
              </div>
              <strong className="inner-voice-card-title">{voice.title}</strong>
              <p>{voice.text}</p>
              <code>{voice.evidence}</code>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);
