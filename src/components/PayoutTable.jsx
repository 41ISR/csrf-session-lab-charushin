const PayoutTable = () => {
    const payouts = [
        { symbols: '💯💯💯', multiplier: 'x100' },
        { symbols: '🎓🎓🎓', multiplier: 'x50' },
        { symbols: '🔥🔥🔥', multiplier: 'x25' },
        { symbols: '🧠🧠🧠', multiplier: 'x15' },
        { symbols: '📚📚📚', multiplier: 'x10' },
        { symbols: '✏️✏️✏️', multiplier: 'x8' },
        { symbols: '❌❌❌', multiplier: 'x0' },
    ]

    const formatSymbols = (symbols) => {
        return Array.from(symbols).join(' ')
    }

    return (
        <div className="payout-table">
            <h3>Таблица выигрышей</h3>
            <div className="payout-grid">
                {payouts.map((payout, index) => (
                    <div key={index} className="payout-item">
                        <span>{formatSymbols(payout.symbols)}</span>
                        <span className="multiplier">{payout.multiplier}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PayoutTable

