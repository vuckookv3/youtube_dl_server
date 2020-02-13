const express = require('express');
const { exec } = require('child_process');
const app = express();
const { middleware: cache } = require('apicache');
const onlyStatus200 = (req, res) => res.statusCode === 200;
const cacheDuration = '3 hours';

app.get('/youtube/:id/:format', cache(cacheDuration, onlyStatus200), (req, res) => {
    // check if youtube ID (must be 11 chars)
    if (!/^[a-zA-Z0-9-_]{11}$/.test(req.params.id))
        return res.status(400).json({ error: { message: 'Youtube ID nije validnog formata' } })
    req.params.id = req.params.id.replace(/&|;| |\\/g, '');
    req.params.format = req.params.format.replace(/&|;| |\\/g, '');

    // make url
    const url = 'https://www.youtube.com/watch?v=' + req.params.id;

    const command = `youtube-dl ${url} -f ${req.params.format} -g --proxy "socks5://188.166.22.22:9150"`

    // summon command
    exec(command, (err, stdout) => {
        if (err) {
            console.error(err);
            return res.status(400).json({ error: { message: 'Došlo je do greške', err } })
        }
        return res.json([stdout]);
    })
})

module.exports = app;
