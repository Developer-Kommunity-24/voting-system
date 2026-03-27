import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import './index.css'
import App from './App.tsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      // proxyUrl={import.meta.env.VITE_CLERK_PROXY_URL}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
