const express = require('express');
const { exec } = require('child_process');
const app = express();

app.get('/youtube/:id/:format', (req, res) => {
    // check if youtube ID (must be 11 chars)
    if (!/^[a-zA-Z0-9-_]{11}$/.test(req.params.id))
        return res.status(400).json({ error: { message: 'Youtube ID nije validnog formata' } })
    req.params.id = req.params.id.replace(/&|;| |\\/g, '');
    req.params.format = req.params.format.replace(/&|;| |\\/g, '');

    // make url
    const url = 'https://www.youtube.com/watch?v=' + req.params.id;

    const command = `youtube-dl ${url} -f ${req.params.format} -g`

    // summon command
    exec(command, (err, stdout) => {
        if (err) return res.status(400).json({ error: { message: 'Došlo je do greške' } })
        return res.json([stdout]);
    })
})

module.exports = app;
