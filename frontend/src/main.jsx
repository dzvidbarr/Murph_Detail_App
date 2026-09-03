import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Admin from './Admin.jsx'

let page = <App />

if(window.location.pathname === "/admin")
{
  page = <Admin />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
