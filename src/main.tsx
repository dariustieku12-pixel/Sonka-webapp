import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import App from './App';
import { AuthProvider } from './lib/auth';
import { UnreadProvider } from './lib/unread';
import { ToastProvider } from './components/Toast';

// HashRouter (URLs like /#/map) so the SPA works on GitHub Pages
// without any server-side rewrite rules.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <UnreadProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </UnreadProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
