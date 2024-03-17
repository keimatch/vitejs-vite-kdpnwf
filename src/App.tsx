import './App.css';
import { Terminal } from './terminal';
import { useWebContainer } from './useWebContainer';

function App() {
  const [{ terminalRef }, { handleSetDidTerminalMount }] = useWebContainer();
  return (
    <div>
      <Terminal ref={terminalRef} setDidMount={handleSetDidTerminalMount} />
    </div>
  );
}

export default App;
