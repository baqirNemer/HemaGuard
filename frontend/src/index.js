import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
    <ToastContainer position="bottom-right" autoClose={3000} /> {/* Toast container for notifications */}
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals(); // Measure and report web vitals (optional)
