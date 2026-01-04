import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

// Suppress CORS and network errors from console
const originalError = console.error;
console.error = function(...args) {
  // Suppress CORS policy errors
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('CORS') || 
       args[0].includes('Failed to fetch') ||
       args[0].includes('ERR_FAILED'))) {
    return;
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
