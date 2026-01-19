import express from 'express'
import session from 'express-session'
import cors from 'cors'
import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3000

const db = new Database(join(__dirname, 'database.db'))

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance INTEGER DEFAULT 1000
    )
`)

// Таблица выплат: комбинация → множитель
const PAYOUTS = {
    '💯💯💯': 100,
    '🎓🎓🎓': 50,
    '🔥🔥🔥': 25,
    '🧠🧠🧠': 15,
    '📚📚📚': 10,
    '✏️✏️✏️': 8,
    '❌❌❌': 0,
}

const SYMBOLS = ['📚', '✏️', '🧠', '🎓', '🔥', '💯', '❌']

function getCombinationMultiplier(symbols) {
    const combo = symbols.join('')
    return PAYOUTS[combo] || 0
}

const csrfTokens = new Map()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

app.use(express.json())

app.use(
    session({
        secret: 'your-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
)

app.get('/csrf-token', (req, res) => {
    const token = crypto.randomBytes(32).toString('hex')
    csrfTokens.set(req.sessionID, token)
    res.json({ csrfToken: token })
})

const validateCsrf = (req, res, next) => {
    const token = req.body.csrfToken
    const sessionToken = csrfTokens.get(req.sessionID)

    if (!token || token !== sessionToken) {
        return res.status(403).json({ error: 'Неверный CSRF токен' })
    }

    next()
}

app.post('/auth/signup', async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' })
    }

    const existingUser = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email)
    if (existingUser) {
        return res.status(400).json({ error: 'Пользователь с таким именем или email уже существует' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashedPassword)
        req.session.userId = result.lastInsertRowid
        const user = db.prepare('SELECT username, balance FROM users WHERE id = ?').get(result.lastInsertRowid)
        res.json({ username: user.username, balance: user.balance })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка регистрации' })
    }
})

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' })
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
    if (!user) {
        return res.status(401).json({ error: 'Неверное имя пользователя или пароль' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
        return res.status(401).json({ error: 'Неверное имя пользователя или пароль' })
    }

    req.session.userId = user.id
    res.json({ username: user.username, balance: user.balance })
})

app.get('/auth/check', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Не авторизован' })
    }

    const user = db.prepare('SELECT username, balance FROM users WHERE id = ?').get(req.session.userId)
    if (!user) {
        return res.status(401).json({ error: 'Пользователь не найден' })
    }

    res.json({ username: user.username, balance: user.balance })
})

app.post('/auth/logout', (req, res) => {
    csrfTokens.delete(req.sessionID)
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка выхода' })
        }
        res.json({ message: 'Выход выполнен' })
    })
})

const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Требуется авторизация' })
    }
    next()
}

app.post('/api/spin', requireAuth, validateCsrf, (req, res) => {
    const { bet } = req.body

    // Валидация ставки
    if (![10, 50, 100].includes(bet)) {
        return res.status(400).json({ error: 'Недопустимая ставка' })
    }

    try {
        // Получаем текущий баланс
        const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.session.userId)
        if (!user || user.balance < bet) {
            return res.status(400).json({ error: 'Недостаточно баллов' })
        }

        // Генерируем случайный результат
        const resultSymbols = Array.from(
            { length: 3 },
            () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        )
        const multiplier = getCombinationMultiplier(resultSymbols)
        const winAmount = multiplier * bet

        // Обновляем баланс в БД
        const newBalance = user.balance - bet + winAmount
        db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, req.session.userId)

        // Отправляем результат
        res.json({
            symbols: resultSymbols,
            winAmount,
            isWin: winAmount > 0,
            newBalance,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

app.get('/api/leaderboard', requireAuth, (req, res) => {
    try {
        const players = db
            .prepare('SELECT username, balance FROM users ORDER BY balance DESC LIMIT 10')
            .all()
        res.json(players)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})

