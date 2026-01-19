import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Button from '../components/Button'

const Signup = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('signup')
    const navigate = useNavigate()
    const { setUser, setCsrfToken } = useAuthStore()

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Пароли не совпадают')
            return
        }

        if (password.length < 6) {
            setError('Пароль должен быть не менее 6 символов')
            return
        }

        if (!validateEmail(email)) {
            setError('Некорректный email')
            return
        }

        try {
            const res = await fetch('/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Ошибка регистрации')
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
                        onClick={() => {
                            setActiveTab('login')
                            navigate('/login')
                        }}>
                        Вход
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signup')}>
                        Регистрация
                    </button>
                </div>
                <form className={`auth-form ${activeTab === 'signup' ? 'active' : ''}`} onSubmit={handleSignup}>
                    <div className="form-group">
                        <label>Имя пользователя</label>
                        <input
                            type="text"
                            placeholder="Придумайте имя"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Введите email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            placeholder="Придумайте пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Подтвердите пароль</label>
                        <input
                            type="password"
                            placeholder="Повторите пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <Button type="submit" className="btn-primary">
                        Создать аккаунт
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default Signup

