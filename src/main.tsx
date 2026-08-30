import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {initPerfTier} from './perf';
import './index.css';
import './styles/focus-modern.css';
// Ultimo import: ajusta el coste de los efectos segun el equipo.
import './styles/focus-performance.css';

// Marca <html data-perf="..."> antes del primer render para que el CSS
// adaptativo ya este activo en la primera pintura.
initPerfTier();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
