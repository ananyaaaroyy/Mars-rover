import { GRID_SIZE } from "../store/useRoverStore";

const HEADING_DEGREES = { N: 0, E: 90, S: 180, W: 270 };

export default function TerrainGrid({ roverPos, heading, obstacles, pathNodes, crashed }) {
  const cells = [];
  const cellPercent = 100 / GRID_SIZE;

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const isObstacle = obstacles.some(o => o.x === x && o.y === y);
      const isPath     = pathNodes.some(p => p.x === x && p.y === y);

      const cls = isObstacle ? 'grid-cell obstacle' : isPath ? 'grid-cell path' : 'grid-cell';
      cells.push(
        <div key={`${x}-${y}`} className={cls}>
          {isObstacle ? '⬡' : ''}
        </div>
      );
    }
  }

  const roverStyle = {
    position: 'absolute',
    left: `${roverPos.x * cellPercent}%`,
    top: `${roverPos.y * cellPercent}%`,
    width: `${cellPercent}%`,
    height: `${cellPercent}%`,
    transition: 'left 0.4s ease, top 0.4s ease',
    zIndex: 10,
    pointerEvents: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: crashed ? '#ff0000cc' : '#00ff8899',
    borderRadius: '4px',
    animation: crashed ? 'pulse 0.3s infinite alternate' : 'none',
  };

  return (
    <>
      <div className="terrain-wrap">
        <div className="terrain-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {cells}
        <div style={roverStyle} className={`grid-rover ${crashed ? 'crashed' : ''}`}>
          <span style={{
            display: "inline-block",
            transform: `rotate(${HEADING_DEGREES[heading]}deg)`,
            transition: "transform 0.3s ease",
            fontSize: "1.1rem",
            color: "#000",
            fontWeight: "bold",
          }}>
            ▲
          </span>
        </div>
      </div>
    </div>
    </>
  );
}