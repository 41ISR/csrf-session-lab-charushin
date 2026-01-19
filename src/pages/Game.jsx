import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Header from '../components/Header'
import SlotMachine from '../components/SlotMachine'
import PayoutTable from '../components/PayoutTable'

const Game = () => {
    const navigate = useNavigate()
    const { balance, setBalance, csrfToken, setCsrfToken, setUser, isAuthenticated } = useAuthStore()
    const [currentBet, setCurrentBet] = useState(10)
    const [isSpinning, setIsSpinning] = useState(false)
    const [reelResults, setReelResults] = useState(['📚', '✏️', '🧠']) // начальное состояние
    const [winMessage, setWinMessage] = useState('')

    const bets = [10, 50, 100]

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

    // Отправка запроса на сервер для спина
    const spin = async () => {
        // проверьте, что у юзера достаточно кредов
        if (isSpinning || balance < currentBet) return

        setIsSpinning(true)
        setWinMessage('')

        try {
            const res = await fetch('/api/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ bet: currentBet, csrfToken }),
            })

            const data = await res.json()

            if (!res.ok) {
                setWinMessage(`❌ ${data.error || 'Ошибка'}`)
                setIsSpinning(false)
                return
            }

            // Анимация длится 1 секунду после ответа сервера
            // Запускаем анимацию, затем устанавливаем результат от сервера
            setTimeout(async () => {
                setReelResults(data.symbols)
                setBalance(data.newBalance)

                if (data.isWin) {
                    setWinMessage(`🎉 ПОЗДРАВЛЯЕМ! Вы получили ${data.winAmount} баллов! 🎉`)
                } else {
                    setWinMessage('😔 К сожалению, вы не выиграли. Попробуйте еще раз!')
                }

                const csrfRes = await fetch('/csrf-token', { credentials: 'include' })
                if (csrfRes.ok) {
                    const csrfData = await csrfRes.json()
                    setCsrfToken(csrfData.csrfToken)
                }

                setIsSpinning(false)
            }, 1000)
        } catch (err) {
            console.error(err)
            setWinMessage('❌ Ошибка соединения с сервером')
            setIsSpinning(false)
        }
    }

    const selectBet = (amount) => {
        // Проверка, что не меняем бет во время спина
        if (!isSpinning) setCurrentBet(amount)
    }

    return (
        <div className="screen active">
            <div className="game-container">
                <Header />

                <div className="slot-machine">
                    <div className="slot-machine-header">
                        <h2>🎲 CAPY CASI 🎲</h2>
                    </div>
                    <SlotMachine symbols={reelResults} isSpinning={isSpinning} />
                    <div className="win-message">{winMessage}</div>
                    <div className="bet-section">
                        <h3>Выберите ставку</h3>
                        <div className="bet-buttons">
                            {bets.map((amount) => (
                                <button
                                    key={amount}
                                    className={`bet-btn ${currentBet === amount ? 'active' : ''}`}
                                    onClick={() => selectBet(amount)}
                                    disabled={isSpinning}>
                                    <span className="bet-amount">{amount}</span>
                                    <span className="bet-label">баллов</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        className="spin-btn"
                        onClick={spin}
                        disabled={isSpinning || balance < currentBet}>
                        <span className="spin-text">КРУТИТЬ</span>
                        <span className="spin-cost">Стоимость: {currentBet} баллов</span>
                    </button>
                </div>

                <PayoutTable />
            </div>
        </div>
    )
}

export default Game

