import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isPlaying?: boolean;
  audioUrl?: string;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying = false,
  audioUrl,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const initAudio = useCallback(async () => {
    if (audioContextRef.current) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      setIsInitialized(true);
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }, []);

  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        // Градиент от turquoise к emerald к gold
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#D89AA7'); // turquoise
        gradient.addColorStop(0.5, '#B97886'); // emerald
        gradient.addColorStop(1, '#D8B878'); // gold

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  }, []);

  useEffect(() => {
    if (isPlaying && !isInitialized) {
      initAudio();
    }

    if (isPlaying && audioUrl && audioContextRef.current && analyserRef.current) {
      // Загружаем и проигрываем аудио
      fetch(audioUrl)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContextRef.current!.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          if (sourceRef.current) {
            sourceRef.current.stop();
          }

          const source = audioContextRef.current!.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(analyserRef.current!);
          analyserRef.current!.connect(audioContextRef.current!.destination);
          source.start();

          sourceRef.current = source;
          drawVisualizer();
        })
        .catch((error) => console.error('Audio playback failed:', error));
    } else if (!isPlaying) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioUrl, isInitialized, initAudio, drawVisualizer]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl overflow-hidden glass ${className}`}
      style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={100}
        className="w-full h-24"
        style={{ background: 'rgba(0, 0, 0, 0.2)' }}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-gray-400">Нажмите Play для визуализации</p>
        </div>
      )}
    </motion.div>
  );
};

// Хук для использования Web Audio API
export const useAudioAnalyzer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>();

  const play = (url: string) => {
    setAudioUrl(url);
    setIsPlaying(true);
  };

  const stop = () => {
    setIsPlaying(false);
    setAudioUrl(undefined);
  };

  return { isPlaying, audioUrl, play, stop };
};