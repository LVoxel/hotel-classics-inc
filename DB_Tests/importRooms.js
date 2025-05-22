const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.sqlite');
const rooms = JSON.parse(fs.readFileSync('./rooms.json', 'utf8'));

db.serialize(() => {
    rooms.forEach(room => {
        db.run(
            `INSERT INTO rooms (name, type, price, available, discounted, guests, rating, image, description, bookedDates)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                room.name,
                room.type,
                room.price,
                room.available ? 1 : 0,
                room.discounted ? 1 : 0,
                room.guests,
                room.rating,
                room.image,
                room.description,
                JSON.stringify(room.bookedDates || [])
            ]
        );
    });
});

db.close();