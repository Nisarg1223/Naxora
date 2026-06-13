import React from "react";
import VoiceOrb from "./VoiceOrb";

const VoiceOverlay = ({
  isOpen,
  onClose,
  voiceState,
  startListening,
  stopListening,
  stopSpeaking,
  isMuted,
  setIsMuted,
  speakingRate,
  setSpeakingRate,
  errorMessage,
  transcript,
}) => {
  if (!isOpen) return null;

  const getStatusText = () => {
    switch (voiceState) {
      case "listening":
        return "Listening to you...";
      case "processing":
        return "Nexora is thinking...";
      case "speaking":
        return "Nexora is speaking...";
      default:
        return "Click microphone to talk";
    }
  };

  const handleMicClick = () => {
    if (voiceState === "listening") {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="voice-overlay-backdrop" onClick={onClose}>
      <div className="voice-overlay-content" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="voice-overlay-header">
          <h3>Nexora Voice Mode</h3>
          <button className="close-voice-btn" onClick={onClose} title="Exit Voice Mode">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Center Orb Section */}
        <div className="voice-orb-section">
          <VoiceOrb state={voiceState} />
          <div className={`voice-status-label state-${voiceState}`}>{getStatusText()}</div>
        </div>

        {/* Real-time Transcript display */}
        <div className="voice-transcript-panel">
          {errorMessage ? (
            <div className="voice-error-text">{errorMessage}</div>
          ) : transcript ? (
            <p className="voice-transcript-text">"{transcript}"</p>
          ) : (
            <p className="voice-transcript-placeholder">Start speaking or check voice status above...</p>
          )}
        </div>

        {/* Bottom Voice Controls */}
        <div className="voice-controls-panel">
          {/* Mute button */}
          <button
            className={`control-circle-btn ${isMuted ? "muted" : ""}`}
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
          >
            {isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M9 9v6a3 3 0 0 0 6 0v-6"></path>
                <path d="M12 3a3 3 0 0 0-3 3v3m6 0V6a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-3.27 5.87M10.73 17.87A7 7 0 0 1 5 12v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>

          {/* Toggle mic / Interrupt speaking */}
          <button
            className={`control-circle-btn mic-toggle-btn active-state-${voiceState}`}
            onClick={handleMicClick}
            title={voiceState === "listening" ? "Stop Listening" : "Start Speaking"}
          >
            {voiceState === "listening" ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>

          {/* Stop Synthesis / TTS */}
          <button
            className="control-circle-btn stop-tts-btn"
            onClick={stopSpeaking}
            disabled={voiceState !== "speaking"}
            title="Stop Response Audio"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          </button>
        </div>

        {/* Speed rate selection */}
        <div className="voice-rate-slider">
          <label>Voice Speed: {speakingRate}x</label>
          <input
            type="range"
            min="0.6"
            max="1.8"
            step="0.1"
            value={speakingRate}
            onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceOverlay;
