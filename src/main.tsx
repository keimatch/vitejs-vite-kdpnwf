import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { WebContainerProvider } from './useWebContainer.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebContainerProvider>
      <App />
    </WebContainerProvider>
  </React.StrictMode>
);
