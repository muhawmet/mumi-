import { describe, it, expect } from 'vitest';
import { dnaDirectives, buildMotionPrompt, primeConcept, conceptRanked } from './brain';
import { DATA } from './pure';

describe('motion prompt quality', () => {
  it('MAPPA dark warrior scenario gets specific DNA directives', () => {
    const refs = ['demon_slayer_breath', 'jujutsu_dark_ritual', 'solo_leveling_rank_shadow']
      .map(id => DATA.refs.find(r => r.id === id)).filter(Boolean) as any[];

    const dna = dnaDirectives(refs, 'STY');
    expect(dna.camera).not.toContain('restrained filmic moves');
    expect(dna.motion).not.toBe('');

    const concept = primeConcept('savaşçı son düşmanıyla yüzleşiyor karanlık sokakta', 'STY', 'mappa_cinematic', 'Climax');
    expect(concept.matched).toBe(true);

    const motion = buildMotionPrompt(1, concept, dna.camera, dna, 8);
    expect(motion).toContain('MOTION');
    expect(motion).toContain('Rhythm:');
    expect(motion.length).toBeGreaterThan(100);
  });

  it('Bones action world produces different motion DNA from MAPPA', () => {
    const bonesRefs = ['dragon_ball_power_aura', 'naruto_chakra_motion', 'anime_silhouette']
      .map(id => DATA.refs.find(r => r.id === id)).filter(Boolean) as any[];
    const mappaRefs = ['jujutsu_dark_ritual', 'demon_slayer_breath', 'solo_leveling_rank_shadow']
      .map(id => DATA.refs.find(r => r.id === id)).filter(Boolean) as any[];

    const dnaBones = dnaDirectives(bonesRefs, 'STY');
    const dnaMAPPA = dnaDirectives(mappaRefs, 'STY');

    expect(dnaBones.motion).not.toBe(dnaMAPPA.motion);
  });

  it('toei adventure concept matches for adventure source text', () => {
    const concepts = conceptRanked('büyük deniz macerası ekip birlikte gidiyor', 'STY', 'toei_adventure', 'Opening Hook');
    const firstMatched = concepts.find(c => c.matched);
    expect(firstMatched).toBeTruthy();
    expect(firstMatched!.subject.length).toBeGreaterThan(10);
  });

  it('MAPPA dark atmospheric concept matches urban darkness source', () => {
    const concept = primeConcept('karanlık kentsel atmosfer duman şehir gerilim', 'STY', 'mappa_cinematic', 'Climax');
    expect(concept.matched).toBe(true);
  });

  it('cursed energy source matches MAPPA cursed space concept', () => {
    const concept = primeConcept('lanetli alan içinde savaş lanetli enerji patlıyor', 'STY', 'mappa_cinematic', 'Climax');
    expect(concept.matched).toBe(true);
  });
});
