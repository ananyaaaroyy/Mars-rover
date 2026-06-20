import { useState } from "react";

// Grid is 15x15
export const GRID_SIZE = 15;

// Initial state factory
export function useRoverStore() {
  const [roverPos, setRoverPos] = useState({ x: 7, y: 7 });
  const [heading, setHeading] = useState("N"); // N, E, S, W
  const [battery, setBattery] = useState(100);
  const [pathNodes, setPathNodes] = useState([{ x: 7, y: 7 }]);
  const [obstacles, setObstacles] = useState([
    { x: 3, y: 4 }, { x: 8, y: 2 }, { x: 11, y: 9 },
    { x: 5, y: 12 }, { x: 13, y: 6 }, { x: 1, y: 8 }
  ]);
  const [script, setScript] = useState("");
  const [logs, setLogs] = useState(["[SYSTEM] Mission ready."]);
  const [isRunning, setIsRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);

  const addLog = (msg) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const reset = () => {
    setRoverPos({ x: 7, y: 7 });
    setHeading("N");
    setBattery(100);
    setPathNodes([{ x: 7, y: 7 }]);
    setLogs(["[SYSTEM] Mission reset."]);
    setCrashed(false);
    setIsRunning(false);
  };

  return {
    roverPos, setRoverPos,
    heading, setHeading,
    battery, setBattery,
    pathNodes, setPathNodes,
    obstacles,
    script, setScript,
    logs, addLog,
    isRunning, setIsRunning,
    crashed, setCrashed,
    reset,
  };
}