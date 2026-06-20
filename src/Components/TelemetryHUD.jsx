import { useRef, useEffect } from "react";

export default function TelemetryHUD({ logs = [] }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [logs]);

  return (
    <section className="telemetry-hud" aria-label="Telemetry">
      <header className="telemetry-header">
        <div className="telemetry-left">
          <span className="telemetry-indicator" aria-hidden />
          <span className="telemetry-title">TELEMETRY</span>
        </div>
        <div className="telemetry-meta">{logs.length} entries</div>
      </header>

      <div ref={logRef} className="telemetry-log">
        {logs.map((l, i) => {
          const isError = l.includes("ERROR") || l.includes("CRASH");
          const isSuccess = l.includes("✓") || l.includes("INIT");
          const entryClass = isError ? "error" : isSuccess ? "success" : "normal";
          return (
            <div key={i} className={`telemetry-entry ${entryClass}`} title={l}>
              <span className="entry-dot" />
              <span className="entry-text">{l}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}