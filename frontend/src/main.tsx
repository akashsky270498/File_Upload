// ==========================================
// 🚀 FRONTEND ENTRY POINT (main.tsx)
// ==========================================
// Ye file React 18 Root render karti hai aur Redux Store Provider wrap karti hai.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

