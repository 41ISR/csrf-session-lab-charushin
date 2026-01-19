import { useEffect, useRef } from 'react'

// Все возможные символы (для анимации "прокрутки"), ДОЛЖНЫ СОВПАДАТЬ С БЭКОМ
const ALL_SYMBOLS = ['📚', '✏️', '🧠', '🎓', '🔥', '💯', '❌']

const Reel = ({ symbol, isSpinning }) => {
    const reelRef = useRef(null)

    useEffect(() => {
        if (!reelRef.current) return

        if (isSpinning) {
            reelRef.current.classList.add('spinning')
            // Сброс позиции для анимации
            reelRef.current.style.top = '0'
        } else {
            reelRef.current.classList.remove('spinning')
            // Найти индекс финального символа
            const index = ALL_SYMBOLS.indexOf(symbol)
            if (index !== -1) {
                // Устанавливаем смещение так, чтобы нужный символ оказался по центру
                // Каждый символ занимает 100px по высоте
                const offset = -index * 100
                reelRef.current.style.top = `${offset}px`
            }
        }
    }, [isSpinning, symbol])

    return (
        <div className="slot">
            <div className="reel" ref={reelRef}>
                {ALL_SYMBOLS.map((sym, i) => (
                    <div className="symbol" key={i}>
                        {sym}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Reel

