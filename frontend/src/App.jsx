import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ClassRoutine from './pages/ClassRoutine.jsx'
import Exams from './pages/Exams.jsx'
import Announcements from './pages/Announcements.jsx'
import CrDashboard from './pages/CrDashboard.jsx'

// App = the shared layout (navbar on top, footer at the bottom)
// plus the page that matches the current URL.
//
// Route table:
//   /                 -> Student Dashboard (default landing page)
//   /routine          -> full weekly class routine
//   /exams            -> upcoming exams
//   /announcements    -> announcement feed
//
// (The CR management dashboard gets its own route in Stage 5.)
export default function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="page-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routine" element={<ClassRoutine />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/cr" element={<CrDashboard />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>
          ClassSync · CSE-2025 Batch · Student view (Stage 1 prototype — using
          mock data)
        </p>
      </footer>
    </div>
  )
}
