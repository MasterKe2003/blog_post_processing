const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/api', (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
        return res.status(400).send('Invalid input');
    }

    const uppercaseLetters = text.match(/[A-Z]/g) || [];
    res.json({ uppercaseLetters });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});