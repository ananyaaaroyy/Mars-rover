// Parses raw script text into instruction objects
// Supports: INIT X Y H, MOVE F/B N, TURN L/R
export function tokenize(scriptText) {
  const lines = scriptText.trim().split("\n");
  const instructions = [];

  for (let line of lines) {
    const parts = line.trim().toUpperCase().split(/\s+/);
    if (parts.length === 0 || parts[0] === "") continue;

    const cmd = parts[0];

    if (cmd === "INIT" && parts.length === 4) {
      instructions.push({
        type: "INIT",
        x: parseInt(parts[1]),
        y: parseInt(parts[2]),
        heading: parts[3],
      });
    } else if (cmd === "MOVE" && parts.length === 3) {
      instructions.push({
        type: "MOVE",
        direction: parts[1], // F or B
        steps: parseInt(parts[2]),
      });
    } else if (cmd === "TURN" && parts.length === 2) {
      instructions.push({
        type: "TURN",
        side: parts[1], // L or R
      });
    } else {
      instructions.push({ type: "UNKNOWN", raw: line });
    }
  }

  return instructions;
}