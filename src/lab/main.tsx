import React from 'react';
import { createRoot } from 'react-dom/client';
import { LabApp } from './LabApp';
import '../styles/tokens.css'; // Load lab styles

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <LabApp />
    </React.StrictMode>
  );
}
