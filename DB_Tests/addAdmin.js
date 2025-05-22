const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

db.run(
    'INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)',
    ['Admin', 'admin@classics.com', 'admin123', 1],
    function (err) {
        if (err) {
            console.error('Ошибка:', err.message);
        } else {
            console.log('Админ добавлен!');
        }
        db.close();
    }
);