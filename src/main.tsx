import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/fraunces';
import './index.css';
import './styles/design_v2.css';
import './styles/design_v3.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useStudioStore } from './store/useStudioStore';

// Dev-only: expose the store so browser-proof scripts (Playwright) can drive real state.
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__mamilas = useStudioStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
