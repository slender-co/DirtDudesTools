import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BidProvider } from './context/BidContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BidProvider>
      <App />
    </BidProvider>
  </React.StrictMode>
);
