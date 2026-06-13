import { useState, useEffect, useRef, useCallback } from "react";

export const useVoice = ({ onFinalTranscript }) => {
  const [voiceState, setVoiceState] = useState("idle"); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [isMuted, setIsMuted] = useState(false);
  const [speakingRate, setSpeakingRate] = useState(1);
  const [errorMessage, setErrorMessage] = useState(null);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const isListeningRef = useRef(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage("Speech recognition is not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false; // Stops when user pauses
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      isListeningRef.current = true;
      setVoiceState("listening");
      setErrorMessage(null);
      setTranscript("");
    };

    rec.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const currentText = final || interim;
      setTranscript(currentText);
    };

    rec.onend = () => {
      isListeningRef.current = false;
      setVoiceState((prev) => {
        if (prev === "listening") {
          return "idle";
        }
        return prev;
      });
    };

    rec.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      isListeningRef.current = false;
      
      if (event.error === "not-allowed") {
        setErrorMessage("Microphone permission denied.");
      } else if (event.error === "no-speech") {
        setErrorMessage("No speech detected.");
      } else {
        setErrorMessage(`Error: ${event.error}`);
      }
      setVoiceState("idle");
    };

    recognitionRef.current = rec;
  }, []);

  // Monitor transcript changes to trigger search on final speech result
  const lastTranscriptRef = useRef("");
  useEffect(() => {
    lastTranscriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (voiceState === "idle" && lastTranscriptRef.current.trim()) {
      onFinalTranscript?.(lastTranscriptRef.current.trim());
      setTranscript("");
    }
  }, [voiceState, onFinalTranscript]);

  const startListening = useCallback(() => {
    // Interruption logic: stop speaking if AI is talking
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    if (!recognitionRef.current) {
      setErrorMessage("Speech recognition not supported.");
      return;
    }

    if (isListeningRef.current) return;

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Failed to start speech recognition:", e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Failed to stop recognition:", e);
      }
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setVoiceState("idle");
  }, []);

  const speakText = useCallback((text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    if (isMuted || !text) {
      setVoiceState("idle");
      return;
    }

    setVoiceState("speaking");

    // Extract plain text from markdown structure so it sounds natural
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "") // remove code blocks entirely
      .replace(/`([^`]+)`/g, "$1") // remove inline code markup
      .replace(/[*#_\-~>]/g, "") // remove formatting symbols
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // clean links keeping text
      .replace(/\s+/g, " ") // clean spacing
      .trim();

    if (!cleanText) {
      setVoiceState("idle");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Fetch and assign the best available English voice
    const voices = synthRef.current.getVoices();
    const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
    
    const bestVoice =
      enVoices.find((v) => v.name.includes("Google") || v.name.includes("Natural")) ||
      enVoices.find((v) => v.lang.includes("US") || v.lang.includes("GB")) ||
      enVoices[0];

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.rate = speakingRate;

    utterance.onend = () => {
      setVoiceState("idle");
    };

    utterance.onerror = (e) => {
      // Don't error out on simple cancels
      if (e.error !== "interrupted") {
        console.error("SpeechSynthesis error:", e);
      }
      setVoiceState("idle");
    };

    synthRef.current.speak(utterance);
  }, [isMuted, speakingRate]);

  return {
    voiceState,
    setVoiceState,
    startListening,
    stopListening,
    stopSpeaking,
    isMuted,
    setIsMuted,
    speakingRate,
    setSpeakingRate,
    errorMessage,
    setErrorMessage,
    transcript,
    speakText,
  };
};
