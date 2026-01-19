import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Logout from './pages/Logout'

function App() {
    const { setUser, setCsrfToken, isAuthenticated } = useAuthStore()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/auth/check', { credentials: 'include' })
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.username, data.balance)
                }
            } catch (error) {
                console.error('Auth check error:', error)
            }
        }

        const fetchCsrfToken = async () => {
            try {
                const res = await fetch('/csrf-token', { credentials: 'include' })
                if (res.ok) {
                    const data = await res.json()
                    setCsrfToken(data.csrfToken)
                }
            } catch (error) {
                console.error('CSRF token error:', error)
            }
        }

        checkAuth()
        fetchCsrfToken()
    }, [setUser, setCsrfToken])

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
                path="/game"
                element={isAuthenticated ? <Game /> : <Navigate to="/login" />}
            />
            <Route
                path="/leaderboard"
                element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" />}
            />
            <Route path="/logout" element={<Logout />} />
            <Route path="/" element={<Navigate to="/game" />} />
        </Routes>
    )
}

export default App

