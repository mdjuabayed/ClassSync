// Navbar — the top navigation bar shared by every page.
//
// - NavLink adds an "active" class automatically for the current URL,
//   which we style so users always know where they are.
// - On small screens the links collapse behind a hamburger button
//   (see navbar.css) to keep the layout usable on phones.

import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/routine', label: 'Class Routine', end: false },
  { to: '/exams', label: 'Exams', end: false },
  { to: '/announcements', label: 'Announcements', end: false },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu after tapping a link
  function handleLinkClick() {
    setMenuOpen(false)
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={handleLinkClick}>
          <span className="brand-mark" aria-hidden="true">
            CS
          </span>
          ClassSync
        </NavLink>

        <span className="role-pill">Student view</span>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>

        <nav
          id="site-nav"
          className={`site-nav${menuOpen ? ' is-open' : ''}`}
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'nav-link is-active' : 'nav-link'
              }
              onClick={handleLinkClick}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
