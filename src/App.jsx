import { useRef, useEffect } from "react";
import { useRoverStore } from "./store/useRoverStore";
import { tokenize } from "./logic/tokenizer";
import { applyTurn, computeNextPos, isObstacle } from "./logic/roverEngine";
import TerrainGrid from "./components/TerrainGrid";
import MissionConsole from "./components/MissionConsole";
import ControlStrip from "./components/ControlStrip";
import TelemetryHUD from "./components/TelemetryHUD";

export default function App() {
  const store = useRoverStore();
  const intervalRef = useRef(null);

  const runScript = () => {
    const instructions = tokenize(store.script);
    const queue = [...instructions];

    let pos     = { ...store.roverPos };
    let heading = store.heading;
    let battery = store.battery;
    let path    = [...store.pathNodes];

    store.setIsRunning(true);
    store.addLog("▶ Executing mission script...");

    intervalRef.current = setInterval(() => {
      if (queue.length === 0) {
        clearInterval(intervalRef.current);
        store.setIsRunning(false);
        store.addLog("✓ Mission complete.");
        return;
      }

      const instr = queue.shift();

      if (instr.type === "INIT") {
        pos     = { x: instr.x, y: instr.y };
        heading = instr.heading;
        store.addLog(`INIT → (${pos.x}, ${pos.y}) facing ${heading}`);
      } else if (instr.type === "TURN") {
        heading = applyTurn(heading, instr.side);
        store.addLog(`TURN ${instr.side} → now facing ${heading}`);
      } else if (instr.type === "MOVE") {
        for (let i = 0; i < instr.steps; i++) {
          const { newPos, blocked, reason } = computeNextPos(pos, heading, instr.direction);
          if (blocked) {
            store.addLog(`ERROR: Hit ${reason}! Aborting.`);
            store.setCrashed(true);
            clearInterval(intervalRef.current);
            store.setIsRunning(false);
            store.setRoverPos(pos);
            return;
          }
          if (isObstacle(newPos, store.obstacles)) {
            store.addLog(`CRASH: Obstacle at (${newPos.x}, ${newPos.y})!`);
            store.setCrashed(true);
            clearInterval(intervalRef.current);
            store.setIsRunning(false);
            store.setRoverPos(newPos);
            return;
          }
          pos = newPos;
          path = [...path, pos];
          battery = Math.max(0, battery - 2);
        }
        store.addLog(`MOVE ${instr.direction} ${instr.steps} → (${pos.x}, ${pos.y})`);
      } else {
        store.addLog(`UNKNOWN command skipped: ${instr.raw}`);
      }

      store.setRoverPos({ ...pos });
      store.setHeading(heading);
      store.setBattery(battery);
      store.setPathNodes([...path]);
    }, 600);
  };

  const pauseScript = () => {
    clearInterval(intervalRef.current);
    store.setIsRunning(false);
    store.addLog("▐▐ Mission paused.");
  };

  const batteryColor = store.battery > 60
    ? "#00ff88" : store.battery > 30
    ? "#ffaa00" : "#ff4444";

  useEffect(() => {
    const handler = (e) => {
      const el = e.target;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (store.isRunning) pauseScript(); else runScript();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store.isRunning]);

  return (
    <div className="app-root">
      <div className="bg-animated" aria-hidden>
        <div className="stars" />
        <div className="nebula" />
        <img className={`rover-float ${store.isRunning ? 'running' : ''}`} src="/rover-float.svg" alt="floating rover" />
      </div>

      {/* TOP NAV BAR */}
      <div className="top-nav">
        <div className="top-left">
          <div className={`status-dot ${store.crashed ? 'crashed' : store.isRunning ? 'running' : ''}`} />
          <span className="brand">MARS ROVER PATH OPERATIONS</span>
        </div>
        <div className="top-right" />
      </div>

      {/* MAIN CONTENT */}
      <div className="main-grid">

        {/* LEFT PANEL — Grid */}
        <div className="left-panel">
          {/* Panel header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.65rem", letterSpacing: "3px", color: "#444" }}>
              TERRAIN MAP
            </span>
            <div style={{ display: "flex", gap: "16px", fontSize: "0.65rem" }}>
              <span style={{ color: "#2d2d5e" }}>■</span>
              <span style={{ color: "#555" }}>PATH</span>
              <span style={{ color: "#5a1a1a" }}>■</span>
              <span style={{ color: "#555" }}>OBSTACLE</span>
              <span style={{ color: "#00ff88" }}>▲</span>
              <span style={{ color: "#555" }}>ROVER</span>
            </div>
          </div>

          <TerrainGrid
            roverPos={store.roverPos}
            heading={store.heading}
            obstacles={store.obstacles}
            pathNodes={store.pathNodes}
            crashed={store.crashed}
          />

          {/* Coordinate display */}
          <div className="coord-grid">
            {[
              { label: "POSITION", value: `(${store.roverPos.x}, ${store.roverPos.y})` },
              { label: "HEADING",  value: store.heading },
              { label: "NODES",    value: store.pathNodes.length },
            ].map(({ label, value }) => (
              <div key={label} className="coord-card">
                <div className="coord-label">{label}</div>
                <div className="coord-value">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — Console */}
        <div className="right-panel">

          {/* Battery bar */}
          <div className="battery-block">
            <div className="battery-row">
              <span className="battery-label">BATTERY</span>
              <span className="battery-value" style={{ color: batteryColor }}>{store.battery}%</span>
            </div>
            <div className="battery-track">
              <div className="battery-level" style={{ width: `${store.battery}%`, background: batteryColor }} />
            </div>
          </div>

          {/* Mission script label */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.6rem", letterSpacing: "3px", color: "#444" }}>MISSION SCRIPT</span>
            <span style={{ fontSize: "0.6rem", color: "#2a2a4a" }}>
              {store.script.trim().split("\n").filter(Boolean).length} commands
            </span>
          </div>

          <MissionConsole script={store.script} setScript={store.setScript} />
          <ControlStrip
            onRun={runScript}
            onPause={pauseScript}
            onReset={store.reset}
            isRunning={store.isRunning}
          />

          {/* Command reference */}
          <div className="command-ref">
            <div className="command-ref-title">COMMAND REFERENCE</div>
            {[
              ["INIT X Y H", "Set start position & heading (N/E/S/W)"],
              ["MOVE F N",   "Move forward N steps"],
              ["MOVE B N",   "Move backward N steps"],
              ["TURN L/R",   "Rotate 90° left or right"],
            ].map(([cmd, desc]) => (
              <div key={cmd} className="command-row">
                <span className="command-code">{cmd}</span>
                <span className="command-desc">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM — Telemetry HUD */}
      <TelemetryHUD
        roverPos={store.roverPos}
        heading={store.heading}
        battery={store.battery}
        pathNodes={store.pathNodes}
        logs={store.logs}
      />
    </div>
  );
}