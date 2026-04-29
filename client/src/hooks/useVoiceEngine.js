import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useVoiceEngine provides integrated Speech-to-Text and Text-to-Speech capabilities.
 * It leverages the Web Speech API, which is powered by Google's engines in supported browsers.
 */
export function useVoiceEngine() {
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(() => localStorage.getItem('voice-tts-enabled') === 'true');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false; // Final results only for cleaner input
      recognition.lang = 'en-GB';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error('[VoiceEngine] Recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  /**
   * Toggle the microphone for voice input.
   * @param {Object} options Configuration for the listening session.
   * @param {Function} options.onResult Callback with the final transcript string.
   * @param {boolean} options.autoSubmit If true, triggers onResult immediately on speech end.
   */
  const toggleListening = useCallback((options = {}) => {
    const { onResult, autoSubmit = false } = options;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // INTERRUPT: Stop AI speaking when user starts talking
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);

      if (recognitionRef.current) {
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (onResult) onResult(transcript, autoSubmit);
        };
        recognitionRef.current.start();
      } else {
        alert('Speech recognition is not supported in this browser. Please use Chrome for the full Gemini voice experience.');
      }
    }
  }, [isListening]);

  /**
   * Stop all current AI speech immediately.
   */
  const interrupt = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  /**
   * Convert text to audible speech using premium Google voices if available.
   * @param {string} text The content to speak.
   */
  const speak = useCallback((text) => {
    if (!isTtsEnabled || !text) return;
    
    // Ensure we are in a browser context
    if (!window.speechSynthesis) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    // Clean text for better speech (remove markdown symbols)
    const cleanText = text.replace(/[*_#`\[\]()]/g, '').replace(/https?:\/\/\S+/g, 'link');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Find a premium Google voice (usually sounds most like Gemini)
    const voices = window.speechSynthesis.getVoices();
    const googleVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
                        voices.find(v => v.lang.startsWith('en'));
                        
    if (googleVoice) utterance.voice = googleVoice;
    
    utterance.rate = 1.05; 
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [isTtsEnabled]);

  /**
   * Toggle automated text-to-speech for assistant responses.
   */
  const toggleTts = useCallback(() => {
    setIsTtsEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem('voice-tts-enabled', newVal);
      if (!newVal) window.speechSynthesis.cancel();
      return newVal;
    });
  }, []);

  return { isListening, isTtsEnabled, isSpeaking, toggleListening, toggleTts, speak, interrupt };
}
