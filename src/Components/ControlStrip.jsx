export default function ControlStrip({ onRun, onPause, onReset, isRunning }) {
  return (
    <div className="control-strip">
      <button
        onClick={isRunning ? onPause : onRun}
        className={`btn primary ${isRunning ? 'running' : ''}`}
      >
        {isRunning ? '▐▐  PAUSE' : '▶  TRANSMIT'}
      </button>

      <button onClick={onReset} className="btn danger">↺  RESET</button>
    </div>
  );
}