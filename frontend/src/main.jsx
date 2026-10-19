import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

// Three CSS files, imported once here:
//   index.css   -> colors, base styles, shared pieces (badges, loading/empty/error)
//   navbar.css  -> top navigation
//   pages.css   -> the individual pages
import './index.css'
import './navbar.css'
import './pages.css'
import './cr.css'

// BrowserRouter enables URL-based navigation (/, /routine, /exams, ...).
// It must wrap the whole App so every page can use <Link> and <NavLink>.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
