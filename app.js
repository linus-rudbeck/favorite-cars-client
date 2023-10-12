const express = require('express');
const path = require('path');

const app = express();

const POST = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(POST, () => {
    console.log(`Live on http://localhost:${POST}`);
});