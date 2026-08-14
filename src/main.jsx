import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import './index.css'
import App from './App.jsx'
import ThemeProvider from './components/ThemeProvider'
import AppToaster from './components/AppToaster'
import { TooltipProvider } from './components/ui/tooltip'

inject()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <App />
        <AppToaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)
