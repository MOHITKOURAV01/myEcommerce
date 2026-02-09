const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('BookSmart API is running');
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
