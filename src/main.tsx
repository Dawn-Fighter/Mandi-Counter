import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { MandiProvider } from './context/MandiContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MandiProvider>
      <App />
    </MandiProvider>
  </StrictMode>,
)
