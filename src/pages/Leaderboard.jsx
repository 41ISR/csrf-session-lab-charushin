import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Player from '../components/Player'

const Leaderboard = () => {
    const [players, setPlayers] = useState([])
    const navigate = useNavigate()
    const { username, isAuthenticated, setUser } = useAuthStore()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/auth/check', { credentials: 'include' })
                if (!res.ok) {
                    navigate('/login')
                    return
                }
                const data = await res.json()
                setUser(data.username, data.balance)
            } catch (error) {
                navigate('/login')
            }
        }

        checkAuth()
    }, [navigate, setUser])

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/leaderboard', { credentials: 'include' })
                if (res.ok) {
                    const data = await res.json()
                    setPlayers(data)
                }
            } catch (error) {
                console.error('Leaderboard error:', error)
            }
        }

        fetchLeaderboard()
    }, [])

    return (
        <div className="screen active">
            <div className="leaderboard-container">
                <button className="back-btn" onClick={() => navigate('/game')}>
                    ← Назад к игре
                </button>
                <h1>🏆 Рейтинг лучших 🏆</h1>
                <div className="leaderboard-table">
                    <div className="leaderboard-header">
                        <span>Место</span>
                        <span>Студент</span>
                        <span>Баллы</span>
                    </div>
                    {players.map((player, index) => (
                        <Player
                            key={index}
                            rank={index + 1}
                            username={player.username}
                            score={player.balance}
                            isCurrentUser={player.username === username}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Leaderboard

