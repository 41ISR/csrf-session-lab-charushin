import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const Header = () => {
    const navigate = useNavigate()
    const { username, balance, logout } = useAuthStore()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <header className="game-header">
            <div className="user-info">
                <span className="username">{username}</span>
                <span className="balance">📊 {balance} баллов</span>
            </div>
            <nav className="game-nav">
                <button className="nav-btn" onClick={() => navigate('/leaderboard')}>
                    🏆 Рейтинг
                </button>
                <button className="nav-btn" onClick={handleLogout}>
                    Выход
                </button>
            </nav>
        </header>
    )
}

export default Header

