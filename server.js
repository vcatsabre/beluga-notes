const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const os = require('os');  // Used to get the VM name

// Serve static files from 'public' directory
const app = express();
const db = new sqlite3.Database('./notes.db');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create Notes table if it doesn't exist
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, username TEXT, note TEXT)");
});

// API to get all notes
app.get('/api/notes', (req, res) => {
    db.all("SELECT * FROM notes", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API to create a new note
app.post('/api/notes', (req, res) => {
    const { username, note } = req.body;
    const stmt = db.prepare("INSERT INTO notes (username, note) VALUES (?, ?)");

    stmt.run(username, note, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
    stmt.finalize();
});

// Endpoint to get VM name
app.get('/api/vm-name', (req, res) => {
    const vmName = os.hostname();  // Get the current VM's hostname
    res.json({ vmName });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
