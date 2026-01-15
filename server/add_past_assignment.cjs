const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
const pastDate = '2025-01-01'; // Past date

db.serialize(() => {
    // Search for Ömer
    db.all("SELECT user_id, ad FROM users WHERE ad LIKE '%Ömer%' OR ad LIKE '%Omer%' OR ad LIKE '%omer%' OR ad LIKE '%ömer%'", (err, users) => {
        if (err || users.length === 0) {
            console.error('User Ömer not found:', err);
            db.close();
            return;
        }

        const userId = users[0].user_id;
        console.log('User found:', users[0].ad, '(ID:', userId, ')');

        // Get a book
        db.all('SELECT book_id, kitap_adi FROM books LIMIT 1', (err, books) => {
            if (err || books.length === 0) {
                console.error('Book not found:', err);
                db.close();
                return;
            }

            const bookId = books[0].book_id;
            const bookName = books[0].kitap_adi;
            console.log('Book found:', bookName, '(ID:', bookId, ')');

            // Insert past assignment
            db.run('INSERT INTO assignments (user_id, book_id, status, due_date) VALUES (?, ?, ?, ?)',
                [userId, bookId, 'assigned', pastDate],
                function (err) {
                    if (err) {
                        console.error('Assignment error:', err.message);
                    } else {
                        console.log('SUCCESS: Past assignment (' + pastDate + ') created for ' + users[0].ad + '. Assignment ID:', this.lastID);
                    }
                    db.close();
                }
            );
        });
    });
});
