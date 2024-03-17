import { forwardRef, useEffect } from 'react';
import 'xterm/css/xterm.css';

export const Terminal = forwardRef<HTMLDivElement, { setDidMount: () => void }>(
  ({ setDidMount }, ref) => {
    useEffect(() => {
      setDidMount();
    }, [setDidMount]);

    return <div id="terminal" ref={ref} />;
  }
);
