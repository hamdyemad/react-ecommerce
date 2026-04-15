import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'

// Suppress internal library deprecations that are out of our control (Clock, etc)
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && (
      args[0].includes('THREE.THREE.Clock') || 
      args[0].includes('PCFSoftShadowMap has been deprecated')
  )) return;
  originalWarn(...args);
};

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
)
