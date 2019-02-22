Instalirati sledece:
    sudo curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
    sudo chmod a+rx /usr/local/bin/youtube-dl

Proveriti da li radi sa sledecom komandom:
    youtube-dl https://www.youtube.com/watch?v=U3Jb4WatU5Q -f best -g

Ukoliko vrati link, OK je.
Ako ne, verovatno nedostaje python.

Klonirati ovaj projekat:
    git clone https://github.com/vuckookv3/youtube_dl_server
    cd youtube_dl_server
    npm i

Pokrenuti projekat, trenutno je podesen na portu 3000.
Ukoliko ima potrebe da se promeni port, imate 2 opcije:
    1. Zameniti ga u ./bin/www linija 14
    2. Pokrenuti projekat sa env varijablom: 
        PORT=3001 npm start ili PORT=3001 node ./bin/www

Kada se pokrene, testirati sa sledecom rutom:
    http://localhost:3000/youtube/U3Jb4WatU5Q/18

Potrebno mi je da se dostavi sledece:
    1. URL koji se gadja umesto http://localhost:3000 (podici neki subdomen ukoliko je potrebno)
    2. Gde da udjem (na koju masinu) da bih mogao da update-ujem youtube-dl program (sa one prve dve linije)