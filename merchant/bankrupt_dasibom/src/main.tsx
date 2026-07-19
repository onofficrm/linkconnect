import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PartnerProvider } from './context/PartnerContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PartnerProvider>
      <App />
    </PartnerProvider>
  </StrictMode>,
);
