const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, './.env') });
const express = require('express');
const URL = require('url');
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

const cacheDuration = 60 * 60 * 6;
const cache = (req, res, next) => {

    redis.get(`youtube:${req.params.id}`).then(value => {
        if (!value) return next();

        return res.json([value]);
    });

}

const proxyServers = [
    "",
    "socks5://Selmarkovucetic:N1s4YiB@185.173.25.55:45786/",
];
let proxyIndex = 0;

app.get('/youtube/:id/:format', cache, (req, res) => {
    // check if youtube ID (must be 11 chars)
    if (!/^[a-zA-Z0-9-_]{11}$/.test(req.params.id))
        return res.status(400).json({ error: { message: 'Youtube ID nije validnog formata' } })
    req.params.id = req.params.id.replace(/&|;| |\\/g, '');
    req.params.format = req.params.format.replace(/&|;| |\\/g, '');

    // make url
    const url = 'https://www.youtube.com/watch?v=' + req.params.id;
    // const proxy = `${proxyServers[proxyIndex++ % proxyServers.length]}`
    // console.log(proxy)
    const command = `youtube-dl ${url} -f ${req.params.format} -g --sleep-interval 1`;

    // summon command
    try {
        if (process.env.METHOD == '1') {
            const a = execSync(command, { encoding: 'utf8' });
            redis.multi().set(`youtube:${req.params.id}`, a).expire(`youtube:${req.params.id}`, cacheDuration).exec()
            res.json([a]);
        } else if (process.env.METHOD == '2') {
            axios.request({
                url: `https://invidio.site/latest_version?id=${req.params.id}&itag=${req.params.format}`,
                method: 'GET',
                maxRedirects: 0,
                validateStatus: (status) => status >= 200 && status < 400,
            })
                .then(res => res.headers.location)
                .then(a => {
                    const z = URL.parse(a, true);
                    let expire = Number(z.query.expire) || cacheDuration;
                    expire = Math.round(expire - Date.now() / 1000);
                    redis.multi().set(`youtube:${req.params.id}`, a).expire(`youtube:${req.params.id}`, expire).exec()
                    res.json([a]);
                })
                .catch(err => {
                    console.error(err.message);
                    return res.status(400).json({ error: { message: 'Došlo je do greške' } });
                })

        }



    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: { message: 'Došlo je do greške' } })
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
