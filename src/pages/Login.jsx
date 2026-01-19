import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Button from '../components/Button'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('login')
    const navigate = useNavigate()
    const { setUser, setCsrfToken } = useAuthStore()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Ошибка входа')
                return
            }

            setUser(data.username, data.balance)
            
            const csrfRes = await fetch('/csrf-token', { credentials: 'include' })
            if (csrfRes.ok) {
                const csrfData = await csrfRes.json()
                setCsrfToken(csrfData.csrfToken)
            }

            navigate('/game')
        } catch (error) {
            setError('Ошибка соединения с сервером')
        }
    }

    return (
        <div className="screen active">
            <div className="auth-container">
                <h1 className="casino-title">🎲 CAPY CASI</h1>
                <div className="auth-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveTab('login')}>
                        Вход
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('signup')
                            navigate('/signup')
                        }}>
                        Регистрация
                    </button>
                </div>
                <form className={`auth-form ${activeTab === 'login' ? 'active' : ''}`} onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Имя пользователя</label>
                        <input
                            type="text"
                            placeholder="Введите имя"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <Button type="submit" className="btn-primary">
                        Войти
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default Login

