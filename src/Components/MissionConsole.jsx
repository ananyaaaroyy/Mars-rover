export default function MissionConsole({ script, setScript }) {
  return (
    <textarea
      className="mission-console"
      value={script}
      onChange={e => setScript(e.target.value)}
      rows={10}
      placeholder={"INIT 7 7 N\nMOVE F 3\nTURN R\nMOVE F 2"}
    />
  );
}