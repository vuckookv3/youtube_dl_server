const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, './.env') });
const express = require('express');
const { execSync } = require('child_process');
const axios = require('axios');

const app = express();
app.set('trust proxy', true);

const Redis = require('ioredis');
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: 6379,
    db: 1,
});

const cacheDuration = 60 * 60 * 12;
const cache = async (req, res, next) => {
    const value = await redis.get(`youtube:${req.params.id}`);
    if (!value) return next();

    return res.json([value]);
}

const proxy = [
    "",
    "socks5://Selmarkovucetic:N1s4YiB@185.173.25.55:45786/",
];
let proxyIndex = 0;

app.get('/axios', async (req, res) => {
    const a = await axios.request(`https://invidio.us/latest_version?id=gvCv_7TuP6g&itag=18`, {
        maxRedirects: 0,
        validateStatus: null,
        method: 'GET'
    })
    console.log(a.headers.location);
    res.json(a.data)
})

app.get('/youtube/:id/:format', cache, async (req, res) => {
    // check if youtube ID (must be 11 chars)
    if (!/^[a-zA-Z0-9-_]{11}$/.test(req.params.id))
        return res.status(400).json({ error: { message: 'Youtube ID nije validnog formata' } })
    req.params.id = req.params.id.replace(/&|;| |\\/g, '');
    req.params.format = req.params.format.replace(/&|;| |\\/g, '');

    // make url
    const url = 'https://www.youtube.com/watch?v=' + req.params.id;
    const command = `youtube-dl ${url} -f ${req.params.format} -g --sleep-interval 1`;

    // summon command
    try {
        // const a = execSync(command, { encoding: 'utf8' });
        const a = await axios.request({
            url: `https://invidio.us/latest_version?id=${req.params.id}&itag=${req.params.format}`,
            method: 'GET',
            maxRedirects: 0,
            validateStatus: null,
        }).then(res => res.headers.location);
        await redis.multi().set(`youtube:${req.params.id}`, a).expire(`youtube:${req.params.id}`, cacheDuration).exec();
        res.json([a]);

    } catch (err) {
        return res.status(400).json({ error: { message: 'Došlo je do greške', info: err } })
    }
})

module.exports = app;

/*

, (err, stdout) => {
        if (err) {
            console.error(err);
            return res.status(400).json({ error: { message: 'Došlo je do greške', err } })
        }
        return res.json([stdout]);
    }
*/