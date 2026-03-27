import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './main.css';
import { App } from './App';
import { ThemeProvider } from './providers/ThemeProvider';

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
