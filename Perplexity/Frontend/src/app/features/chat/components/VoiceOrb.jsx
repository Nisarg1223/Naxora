import React from "react";
import { motion } from "framer-motion";

const VoiceOrb = ({ state }) => {
  // state: 'idle' | 'listening' | 'processing' | 'speaking'

  // Variants for the core central orb
  const orbVariants = {
    idle: {
      scale: 1,
      boxShadow: "0 0 35px rgba(34, 197, 94, 0.4)",
      transition: { duration: 1.8, repeat: Infinity, repeatType: "reverse" },
    },
    listening: {
      scale: [1, 1.15, 1],
      boxShadow: "0 0 60px rgba(34, 197, 94, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.25)",
      transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
    },
    processing: {
      scale: 1.05,
      boxShadow: "0 0 45px rgba(167, 139, 250, 0.7)",
      borderRadius: ["50% 50% 50% 50%", "45% 55% 45% 55%", "55% 45% 55% 45%", "50% 50% 50% 50%"],
      transition: {
        borderRadius: { duration: 2, repeat: Infinity, ease: "linear" },
        duration: 0.5,
      },
    },
    speaking: {
      scale: [1, 1.25, 0.95, 1.15, 1],
      boxShadow: "0 0 70px rgba(59, 130, 246, 0.75)",
      transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="voice-orb-container">
      {/* Listening ripples */}
      {state === "listening" && (
        <>
          <motion.div
            className="orb-ripple ripple-green"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 2.2 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="orb-ripple ripple-green"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 2.2 }}
            transition={{ duration: 2.2, delay: 0.7, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="orb-ripple ripple-green"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 2.2 }}
            transition={{ duration: 2.2, delay: 1.4, repeat: Infinity, ease: "easeOut" }}
          />
        </>
      )}

      {/* Speaking ripples */}
      {state === "speaking" && (
        <>
          <motion.div
            className="orb-ripple ripple-blue"
            animate={{
              scale: [1, 1.9, 1.3, 2.3, 1],
              opacity: [0.7, 0.1, 0.5, 0, 0.7],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="orb-ripple ripple-blue"
            animate={{
              scale: [1, 1.5, 2.0, 1.2, 1],
              opacity: [0.5, 0.2, 0, 0.4, 0.5],
            }}
            transition={{ duration: 2.3, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Thinking / Processing rotating ring */}
      {state === "processing" && (
        <motion.div
          className="processing-ring"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Main core orb */}
      <motion.div
        className={`core-orb orb-${state}`}
        variants={orbVariants}
        animate={state}
      >
        <div className="orb-inner-glow" />
      </motion.div>
    </div>
  );
};

export default VoiceOrb;
