import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import { store } from './store'
import './index.css'
import App from './App'
import { GoogleOAuthProvider } 
from '@react-oauth/google';




createRoot(document.getElementById('root')!).render(
  
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
</GoogleOAuthProvider>
)
