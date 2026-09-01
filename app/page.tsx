'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Gift,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

const confetti = Array.from({ length: 18 }, (_, index) => index + 1);

const melody = [
  ['G4', 0.32], ['G4', 0.18], ['A4', 0.5], ['G4', 0.5], ['C5', 0.5], ['B4', 0.95],
  ['G4', 0.32], ['G4', 0.18], ['A4', 0.5], ['G4', 0.5], ['D5', 0.5], ['C5', 0.95],
  ['G4', 0.32], ['G4', 0.18], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5], ['B4', 0.5], ['A4', 0.95],
  ['F5', 0.32], ['F5', 0.18], ['E5', 0.5], ['C5', 0.5], ['D5', 0.5], ['C5', 1.1],
] as const;

const frequencies: Record<string, number> = {
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

function BirthdayCalendar() {
  return (
    <div className="calendar" aria-label="September 2 birthday calendar">
      <div className="calendar-rings" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="calendar-top">
        <span>SEPTEMBER</span>
        <Sparkles aria-hidden="true" />
      </div>
      <div className="calendar-date">
        <span className="date-number">2</span>
        <span className="date-label">BIRTHDAY</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopMusic = useCallback(() => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    oscillatorsRef.current.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // The oscillator may already have finished naturally.
      }
    });
    oscillatorsRef.current = [];
    masterGainRef.current = null;
    if (audioContextRef.current) void audioContextRef.current.close();
    audioContextRef.current = null;
    setPlaying(false);
  }, []);

  const playMusic = useCallback(async () => {
    stopMusic();

    const context = new AudioContext();
    await context.resume();
    const master = context.createGain();
    master.gain.setValueAtTime(muted ? 0 : 0.42, context.currentTime);
    master.connect(context.destination);
    audioContextRef.current = context;
    masterGainRef.current = master;

    const beat = 0.58;
    let cursor = context.currentTime + 0.08;

    melody.forEach(([note, length], index) => {
      const duration = length * beat;
      const frequency = frequencies[note];
      const tone = context.createOscillator();
      const shimmer = context.createOscillator();
      const toneGain = context.createGain();
      const shimmerGain = context.createGain();

      tone.type = 'sine';
      tone.frequency.setValueAtTime(frequency, cursor);
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(frequency * 2, cursor);

      toneGain.gain.setValueAtTime(0.001, cursor);
      toneGain.gain.exponentialRampToValueAtTime(0.82, cursor + 0.018);
      toneGain.gain.exponentialRampToValueAtTime(0.001, cursor + duration * 0.96);
      shimmerGain.gain.setValueAtTime(0.001, cursor);
      shimmerGain.gain.exponentialRampToValueAtTime(0.11, cursor + 0.01);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, cursor + duration * 0.7);

      tone.connect(toneGain).connect(master);
      shimmer.connect(shimmerGain).connect(master);
      tone.start(cursor);
      shimmer.start(cursor);
      tone.stop(cursor + duration);
      shimmer.stop(cursor + duration);
      oscillatorsRef.current.push(tone, shimmer);

      if ([0, 6, 12, 19].includes(index)) {
        const chime = context.createOscillator();
        const chimeGain = context.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(frequency / 2, cursor);
        chimeGain.gain.setValueAtTime(0.001, cursor);
        chimeGain.gain.exponentialRampToValueAtTime(0.16, cursor + 0.03);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, cursor + beat * 1.5);
        chime.connect(chimeGain).connect(master);
        chime.start(cursor);
        chime.stop(cursor + beat * 1.5);
        oscillatorsRef.current.push(chime);
      }

      cursor += duration;
    });

    setPlaying(true);
    const totalDuration = Math.max(0, cursor - context.currentTime + 0.2);
    endTimerRef.current = setTimeout(() => {
      setPlaying(false);
      oscillatorsRef.current = [];
      masterGainRef.current = null;
      void context.close();
      audioContextRef.current = null;
    }, totalDuration * 1000);
  }, [muted, stopMusic]);

  useEffect(() => stopMusic, [stopMusic]);

  const openCard = () => {
    setOpened(true);
    void playMusic();
  };

  const toggleMute = () => {
    setMuted((current) => {
      const next = !current;
      if (audioContextRef.current && masterGainRef.current) {
        masterGainRef.current.gain.setTargetAtTime(
          next ? 0 : 0.42,
          audioContextRef.current.currentTime,
          0.03,
        );
      }
      return next;
    });
  };

  return (
    <main className={`card-shell ${opened ? 'is-open' : ''}`}>
      <div className="ambient-glow" aria-hidden="true" />
      <div className="gold-frame" aria-hidden="true" />

      <div className="party-layer" aria-hidden="true">
        {confetti.map((item) => (
          <span key={item} className={`confetti confetti-${item}`} />
        ))}
        <span className="star star-one">✦</span>
        <span className="star star-two">✦</span>
        <span className="star star-three">✧</span>
      </div>

      {opened && (
        <div className="music-controls" aria-label="Birthday music controls">
          <span className={`now-playing ${playing && !muted ? 'is-playing' : ''}`} aria-hidden="true">
            <Music2 />
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="music-button"
            onClick={playing ? stopMusic : playMusic}
            aria-label={playing ? 'Pause birthday music' : 'Play birthday music'}
            title={playing ? 'Pause music' : 'Play music'}
          >
            {playing ? <Pause /> : <Play />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="music-button"
            onClick={playMusic}
            aria-label="Replay birthday music"
            title="Replay music"
          >
            <RotateCcw />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="music-button"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute birthday music' : 'Mute birthday music'}
            title={muted ? 'Unmute music' : 'Mute music'}
          >
            {muted ? <VolumeX /> : <Volume2 />}
          </Button>
        </div>
      )}

      <section className="birthday-stage" aria-label="Birthday card for Katrina">
        <figure className="portrait-panel">
          <div className="portrait-aura" aria-hidden="true" />
          <div className="portrait-frame">
            <img src="/katrina.jpg" alt="Katrina seated in a hanging chair" className="portrait" />
          </div>
        </figure>

        <div className="birthday-copy">
          <p className="eyebrow">
            <span aria-hidden="true" />
            For Katrina · 02 September
            <span aria-hidden="true" />
          </p>
          <h1>
            <span>Happy Birthday</span>
            <strong>Katrina!</strong>
          </h1>
          <p className="wish">Stay happy! Stay fit! Stay wise!</p>
          <div className="flourish" aria-hidden="true">
            <span />
            <Sparkles />
            <span />
          </div>
        </div>

        <aside className="celebration-panel" aria-label="Birthday celebration details">
          <div className="cake-preview">
            <div className="cake-glow" />
            <img
              src="/birthday-cake.png"
              alt="A colorful three-tier birthday cake with five glowing candles"
              className="birthday-cake"
            />
          </div>
          <BirthdayCalendar />
        </aside>
      </section>

      {!opened && (
        <div className="entry-screen" role="dialog" aria-modal="true" aria-labelledby="entry-title">
          <div className="entry-mark" aria-hidden="true">
            <span>✦</span>
            <div>K</div>
            <span>✦</span>
          </div>
          <p className="entry-kicker">A LITTLE CELEBRATION</p>
          <h2 id="entry-title">Something special is waiting</h2>
          <p className="entry-copy">Turn up the sound and make a wish.</p>
          <Button className="open-button" onClick={openCard}>
            <Gift aria-hidden="true" />
            Open your card
          </Button>
        </div>
      )}
    </main>
  );
}
