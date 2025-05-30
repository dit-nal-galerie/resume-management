import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import "./styles.css";
import App from './App';
import './custom.css';

// Import i18n configuration
import './i18n/i18n';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
