const Player = ({ rank, username, score, isCurrentUser }) => {
    const getRankDisplay = () => {
        if (rank === 1) return '🥇 1'
        if (rank === 2) return '🥈 2'
        if (rank === 3) return '🥉 3'
        return rank
    }

    const getRankClass = () => {
        if (rank === 1) return 'rank-1'
        if (rank === 2) return 'rank-2'
        if (rank === 3) return 'rank-3'
        return ''
    }

    return (
        <div className={`leaderboard-row ${getRankClass()} ${isCurrentUser ? 'highlight' : ''}`}>
            <span className="rank">{getRankDisplay()}</span>
            <span className="player">{isCurrentUser ? `${username} (Вы)` : username}</span>
            <span className="score">{score.toLocaleString()}</span>
        </div>
    )
}

export default Player

