import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'
import { TooltipProvider } from './components/ui/tooltip'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TooltipProvider delayDuration={200}>
      <App />
      <Toaster theme="dark" position="top-center" richColors />
    </TooltipProvider>
  </StrictMode>,
)
