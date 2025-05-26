const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

const db = mysql.createPool({
    host: 'rudy.zzz.com.ua',
    user: 'olekksa',
    password: 'jk2h3fIUl2k3jriIQJKK!',
    database: 'olekksa',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Тест подключения к базе данных
db.getConnection((err, connection) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Успешно подключен к базе данных MySQL');
        connection.release();
    }
});

db.query(`
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    available TINYINT DEFAULT 1,
    discounted TINYINT DEFAULT 0,
    guests INT DEFAULT 2,
    rating FLOAT DEFAULT NULL,
    image TEXT,
    description TEXT,
    bookedDates TEXT
);
`, (err) => { if (err) console.error('Ошибка создания таблицы rooms:', err); });

db.query(`
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    isAdmin TINYINT DEFAULT 0
);
`, (err) => { if (err) console.error('Ошибка создания таблицы users:', err); });

// Получить все номера
app.get('/api/rooms', (req, res) => {
    db.query('SELECT * FROM rooms', (err, results) => {
        if (err) return res.status(500).json({ error: 'Cannot read rooms' });
        const rooms = results.map(room => ({
            ...room,
            available: !!room.available,
            discounted: !!room.discounted,
            bookedDates: room.bookedDates ? JSON.parse(room.bookedDates) : []
        }));
        res.json(rooms);
    });
});

// Добавить номер
app.post('/api/rooms', (req, res) => {
    const {
        name, type, price, available, discounted,
        guests, rating, image, description, bookedDates
    } = req.body;
    db.query(
        `INSERT INTO rooms (name, type, price, available, discounted, guests, rating, image, description, bookedDates)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name, type, price, available ? 1 : 0, discounted ? 1 : 0,
            guests, rating, image, description, JSON.stringify(bookedDates || [])
        ],
        (err, result) => {
            if (err) {
                console.error('Ошибка при добавлении номера:', err);
                return res.status(500).json({ error: 'Cannot save room' });
            }
            res.json({ success: true, id: result.insertId });
        }
    );
});

// Удалить номер
app.delete('/api/rooms/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    db.query('DELETE FROM rooms WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'Cannot delete room' });
        res.json({ success: true });
    });
});

// Обновить номер
app.put('/api/rooms/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const {
        name, type, price, available, discounted,
        guests, rating, image, description, bookedDates
    } = req.body;
    db.query(
        `UPDATE rooms SET
            name = ?, type = ?, price = ?, available = ?, discounted = ?,
            guests = ?, rating = ?, image = ?, description = ?, bookedDates = ?
         WHERE id = ?`,
        [
            name, type, price, available ? 1 : 0, discounted ? 1 : 0,
            guests, rating, image, description, JSON.stringify(bookedDates || []), id
        ],
        (err) => {
            if (err) return res.status(500).json({ error: 'Cannot update room' });
            res.json({ success: true });
        }
    );
});

// Добавить даты бронирования
app.patch('/api/rooms/:id/book', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { newDates } = req.body;
    db.query('SELECT bookedDates FROM rooms WHERE id = ?', [id], (err, results) => {
        if (err || !results.length) return res.status(500).json({ error: 'Room not found' });
        let bookedDates = [];
        try {
            bookedDates = results[0].bookedDates ? JSON.parse(results[0].bookedDates) : [];
        } catch { bookedDates = []; }
        const updated = Array.from(new Set([...bookedDates, ...newDates]));

        const available = 0;

        db.query(
            'UPDATE rooms SET bookedDates = ?, available = ? WHERE id = ?',
            [JSON.stringify(updated), available, id],
            (err2) => {
                if (err2) return res.status(500).json({ error: 'Cannot update booked dates' });
                res.json({ success: true, bookedDates: updated, available });
            }
        );
    });
});

// Получить всех пользователей
app.get('/api/users', (req, res) => {
    db.query('SELECT id, name, email, isAdmin FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: 'Cannot read users' });
        res.json(results);
    });
});

// Зарегистрировать пользователя
app.post('/api/users', (req, res) => {
    const { name, email, password, isAdmin } = req.body;
    db.query(
        'INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)',
        [name, email, password, isAdmin ? 1 : 0],
        (err, result) => {
            if (err) return res.status(400).json({ error: 'User already exists or invalid data' });
            res.json({ success: true, id: result.insertId });
        }
    );
});

// Вход (логин)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.query(
        'SELECT id, name, email, isAdmin FROM users WHERE email = ? AND password = ?',
        [email, password],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Cannot read users' });
            const user = results[0];
            if (!user) return res.status(401).json({ error: 'Invalid credentials' });
            res.json(user);
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});