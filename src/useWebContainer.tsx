import React, {
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { WebContainer, FileSystemTree } from '@webcontainer/api';
import { Terminal as Xterm } from 'xterm';

export const files: FileSystemTree = {
  'index.js': {
    file: {
      contents: `
import express from 'express';
const app = express();
const port = 3111;
  
app.get('/', (req, res) => {
    res.send('Welcome to a WebContainers app! 🥳');
});
  
app.listen(port, () => {
    console.log(\`App is live at http://localhost:\${port}\`);
});`,
    },
  },
  'package.json': {
    file: {
      contents: `
          {
            "name": "example-app",
            "type": "module",
            "dependencies": {
              "express": "latest",
              "nodemon": "latest"
            },
            "scripts": {
              "start": "nodemon index.js"
            }
          }`,
    },
  },
};

type ContextValue = readonly [
  {
    terminalRef: React.RefObject<HTMLDivElement>;
  },
  {
    handleSetDidTerminalMount: () => void;
  }
];

const defaultValue: ContextValue = [
  {
    terminalRef: {} as React.RefObject<HTMLDivElement>,
  },
  {
    handleSetDidTerminalMount: () => {},
  },
];

const WebContainerContext = createContext<ContextValue>(defaultValue);
export const useWebContainer = () => {
  return useContext(WebContainerContext);
};

export const WebContainerProvider = ({
  children,
}: {
  children: ReactElement;
}) => {
  // --- refs
  const webContainerRef = useRef<WebContainer | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // --- state
  const [didTerminalMount, setDidTerminalMount] = useState(false);

  // --- methods
  const handleSetDidTerminalMount = useCallback(() => {
    setDidTerminalMount(true);
  }, []);

  const startDevServer = useCallback(async (terminal: Xterm) => {
    // Run `npm run start` to start the Express app
    if (!webContainerRef.current) {
      throw new Error('webContainerRef is not mounted');
    }
    const serverProcess = await webContainerRef.current.spawn('npm', [
      'run',
      'start',
    ]);

    serverProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data);
        },
      })
    );
  }, []);

  const installDependencies = async (terminal: Xterm) => {
    // Install dependencies
    if (!webContainerRef.current) {
      throw new Error('webContainerRef is not mounted');
    }
    const installProcess = await webContainerRef.current.spawn('npm', [
      'install',
    ]);
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data);
        },
      })
    );
    // Wait for install command to exit
    return installProcess.exit;
  };

  const initialize = useCallback(async () => {
    const terminal = new Xterm({
      convertEol: true,
    });
    console.log('terminal-ref', terminalRef.current);
    if (!terminalRef.current) {
      throw new Error('terminalRef is not mounted');
    }
    terminal.open(terminalRef.current);

    webContainerRef.current = await WebContainer.boot();
    await webContainerRef.current.mount(files);
    const exitCode = await installDependencies(terminal);
    if (exitCode !== 0) {
      throw new Error('Installation failed');
    }

    startDevServer(terminal);
  }, [startDevServer]);

  // const writeIndexJS = async (content: string) => {
  //   await webContainerRef.current?.fs.writeFile('/index.js', content);
  // };

  // --- effects
  useEffect(() => {
    if (!didTerminalMount) return;
    initialize();
  }, [didTerminalMount, initialize]);

  // --- context value
  const value: ContextValue = [
    { terminalRef },
    { handleSetDidTerminalMount },
  ] as const;

  return (
    <WebContainerContext.Provider value={value}>
      {children}
    </WebContainerContext.Provider>
  );
};
