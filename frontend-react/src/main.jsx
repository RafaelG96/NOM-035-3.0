import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import './utils/debug.js' // Cargar utilidades de debug
import App from './App.jsx'
import { FormLockProvider } from './context/FormLockContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FormLockProvider>
        <App />
      </FormLockProvider>
    </BrowserRouter>
  </StrictMode>,
)
