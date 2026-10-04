import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import { AppShell } from './components/AppShell'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Recover from './pages/Recover'
import NotFound from './pages/NotFound'
import Today from './pages/Today'
import Habits from './pages/Habits'
import HabitForm from './pages/HabitForm'
import Categories from './pages/Categories'
import Calendar from './pages/Calendar'
import Stats from './pages/Stats'
import HabitStats from './pages/HabitStats'
import SettingsPage from './pages/Settings'

function Tracker({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover" element={<Recover />} />

          <Route
            path="/app/today"
            element={
              <Tracker>
                <Today />
              </Tracker>
            }
          />
          <Route
            path="/app/habits"
            element={
              <Tracker>
                <Habits />
              </Tracker>
            }
          />
          <Route
            path="/app/habits/new"
            element={
              <Tracker>
                <HabitForm />
              </Tracker>
            }
          />
          <Route
            path="/app/habits/:id/edit"
            element={
              <Tracker>
                <HabitForm />
              </Tracker>
            }
          />
          <Route
            path="/app/categories"
            element={
              <Tracker>
                <Categories />
              </Tracker>
            }
          />
          <Route
            path="/app/calendar"
            element={
              <Tracker>
                <Calendar />
              </Tracker>
            }
          />
          <Route
            path="/app/stats"
            element={
              <Tracker>
                <Stats />
              </Tracker>
            }
          />
          <Route
            path="/app/stats/:id"
            element={
              <Tracker>
                <HabitStats />
              </Tracker>
            }
          />
          <Route
            path="/app/settings"
            element={
              <Tracker>
                <SettingsPage />
              </Tracker>
            }
          />

          <Route path="/today" element={<Navigate to="/app/today" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
