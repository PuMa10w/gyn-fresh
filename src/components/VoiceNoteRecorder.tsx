import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PremiumButton } from './PremiumButton';

interface VoiceNoteRecorderProps {
  onTranscript?: (text: string) => void;
  className?: string;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onTranscript,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Проверяем поддержку Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ru-RU'; // Русский язык!

    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        }
      }

      const fullText = transcript + finalTranscript;
      setTranscript(fullText);

      if (finalTranscript && onTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
  };

  if (!isSupported) {
    return (
      <div className={`voice-recorder glass ${className}`} style={{ padding: '16px', borderRadius: '12px' }}>
        <p style={{ opacity: 0.7 }}>⚠️ Ваш браузер не поддерживает голосовой ввод (Web Speech API)</p>
      </div>
    );
  }

  return (
    <motion.div
      className={`voice-recorder glass ${className}`}
      style={{
        padding: '20px',
        borderRadius: '16px',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <motion.div
          animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ repeat: isListening ? Infinity : 0, duration: 1.5 }}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isListening ? '#ef4444' : '#6b7280',
            boxShadow: isListening ? '0 0 12px #ef4444' : 'none',
          }}
        />
        <h3 className="text-gradient" style={{ margin: 0 }}>
          🎙️ Голосовой помощник
        </h3>
      </div>

      <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '16px' }}>
        Нажмите кнопку и надиктуйте симптомы или заметки. Текст появится ниже автоматически.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <PremiumButton
          onClick={toggleListening}
          variant={isListening ? 'danger' : 'primary'}
          shimmer={isListening}
        >
          {isListening ? '⏹️ Остановить запись' : '🎙️ Начать запись'}
        </PremiumButton>
        
        {transcript && (
          <PremiumButton onClick={handleCopy} variant="ghost" size="sm">
            📋 Копировать
          </PremiumButton>
        )}
      </div>

      {transcript && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '12px',
            borderRadius: '8px',
            minHeight: '60px',
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>{transcript}</p>
        </motion.div>
      )}

      {isListening && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ fontSize: '12px', opacity: 0.6, textAlign: 'center', marginTop: '12px' }}
        >
          🎙️ Слушаю... Говорите!
        </motion.p>
      )}
    </motion.div>
  );
};