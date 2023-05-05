import "./GameController.css";
import React, { useEffect, useState } from "react";
import { Action, actionForKey, actionIsDrop } from "../business/Input";
import { playerController } from "../business/PlayerController";
import { useDropTime } from "../hooks/useDropTime";
import { useInterval } from "../hooks/useInterval";
import * as speech from "@tensorflow-models/speech-commands";
import * as tf from "@tensorflow/tfjs";
import "./Commands.css"

const GameController = ({
  board,
  gameStats,
  player,
  setGameOver,
  setPlayer,
}) => {
  const [dropTime, pauseDropTime, resumeDropTime] = useDropTime({
    gameStats,
  });

  useInterval(() => {
    handleInput({ action: Action.SlowDrop });
  }, dropTime);

  const onKeyUp = ({ code }) => {
    const action = actionForKey(code);
    if (actionIsDrop(action)) resumeDropTime();
  };

  const onKeyDown = ({ code }) => {
    const action = actionForKey(code);

    if (action === Action.Pause) {
      if (dropTime) {
        pauseDropTime();
      } else {
        resumeDropTime();
      }
    } else if (action === Action.Quit) {
      setGameOver(true);
    } else {
      if (actionIsDrop(action)) pauseDropTime();
      if (!dropTime) {
        return;
      }
      handleInput({ action });
    }
  };

  const handleInput = ({ action }) => {
    playerController({
      action,
      board,
      player,
      setPlayer,
      setGameOver,
    });
  };

  const [voiceRecognizer, setVoiceRecognizer] = useState(null);
  const [currentVoiceCommand, setCurrentVoiceCommand] = useState(null);
  const [previousVoiceCommand, setPreviousVoiceCommand] = useState(null);

  const setupSpeechRecognition = async () => {
    const recognizer = speech.create("BROWSER_FFT", 'directional4w');
    await recognizer.ensureModelLoaded();
    recognizer.listen(
      (result) => {
        const labels = recognizer.wordLabels();
        const command =
          labels[result.scores.indexOf(Math.max(...result.scores))];
        setCurrentVoiceCommand(command);
      },
      { overlapFactor: 0.25 ,includeSpectrogram: true, probabilityThreshold: 0.9 }
    );
    setVoiceRecognizer(recognizer);
  };
  useEffect(() => {
    setupSpeechRecognition();

    return () => {
      if (voiceRecognizer) {
        voiceRecognizer.stopListening();
        setVoiceRecognizer(null);
      }
    };
  }, []);

  const handleVoiceCommand = (command) => {
    const actions = {
      left: Action.Left,
      right: Action.Right,
      down: Action.FastDrop,
      up: Action.Rotate,
    };

    const action = actions[command];
    if (action && dropTime) {
      handleInput({ action });
      if (actionIsDrop(action)) resumeDropTime();
    }
    
  };

  useEffect(() => {
    console.log("currentVoiceCommand", currentVoiceCommand);
    if (!currentVoiceCommand) return;
    handleVoiceCommand(currentVoiceCommand);
    setPreviousVoiceCommand(currentVoiceCommand);
    setCurrentVoiceCommand(null);
  }, [currentVoiceCommand]);

  return (
    <div style={{display:'flex', flexDirection:'row'}}>
      <div className="Commands">{previousVoiceCommand}</div>
      <input
        className="GameController"
        type="text"
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        autoFocus
      />
    </div>
  );
};

export default GameController;
