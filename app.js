module.exports = {getCreds};

const express = require('express')
const bodyParser = require('body-parser');
const helmet = require('helmet')
const app = express();
const {sendEmail} = require("./src/mail");
const fs = require('fs');
const cp = require('child_process');

// default credentials to overwrite on open
let gmail = "";
let pass = "";
let kindle = "";

let message = "";

// helmet setup
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);
app.disable('cross-origin-embedder-policy');

// basic networking setup and includes

const ejs = require('ejs');
const {scrapeMangaProfile, scrapeMangaSearch, scrapeMangaChapter, getProgress} = require("./src/scraper");

// more includes for the server
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({extend:true}));
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname);

// create necessary files
fs.appendFile("./.cred", '', function (err) {
    if (err) throw err;
});
fs.mkdirSync('./temp/manga_out', { recursive: true });
const logfile = './temp/manga_out/log.manga';
fs.appendFile(logfile, '', function (err) {
    if (err) throw err;
    console.log('Saved!');
});

// home page
app.get('/', (req, res) => {
    let recents = [];
    let info = "";

    if (fs.readFileSync(logfile, 'utf8').length === 0) {
        console.log("No recent manga.");
        info = "No recent manga.";
    }
    else {
        // read all lines from file
        const data = fs.readFileSync(logfile, 'utf8');
        // split the contents by new line
        const lines = data.split(/\r?\n/);
        // print all lines
        lines.forEach((line) => {
            // split over comma
            const parts = line.split(',');
            // print the first part
            if (parts[0] !== "") {
                recents.push({short: parts[0], type: parts[1]});
            }
        });
    }
    console.log(recents);
    res.render("index",{
        'info': info,
        'message': message,
        recents: recents
    });
})



app.post('/search', async function (req, res) {
    console.log("we are here");
    console.log(req);
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));
    app.use(express.json());       // to support JSON-encoded bodies
    app.use(express.urlencoded()); // to support URL-encoded bodies

    const manga_name = req.body.manga;
    let manga;
    try {
        console.log("we are here", manga_name);
        const url = 'https://kissmanga.org/manga_list?q=' + manga_name + '&action=search';
        manga = await scrapeMangaSearch(url);
    } catch (e) {
        console.log(e);
    }
    console.log(manga);
    res.render("search", {
        results: manga
    });
});



let getCover = async function(uri, filename){
    try {
        await fs.rmSync('temp/image', { recursive: true });
    } catch (e) {
        console.log("Probably no temp/image folder. This should be fine.");
    }
    fs.mkdirSync('temp/image', { recursive: true });
    let command = `curl -o temp/image/${filename}  ${uri}`;
    let result = cp.execSync(command);
};

let manga;
app.get('/profile', async function (req, res) {
    try {
        // extract query parameters
        const type = req.query.type;
        const link = req.query.link;

        console.log("we are here", link, type);

        switch (type) {
            case 'KissManga':{
                await getCover('https://kissmanga.org/mangaimage/' + link + '.jpg', 'cover.jpg')
                fs.mkdirSync('./temp/manga/image', { recursive: true });
                fs.copyFileSync('./temp/image/cover.jpg', './temp/manga/image/' + link + '.jpg');
                manga = await scrapeMangaProfile('https://kissmanga.org/manga/' + link);
                console.log("oki");
                break;
            }
            default:{
                manga = null;
            }
        }

    } catch (e) {
        console.log(e);
    }

    console.log(manga, "manga");
    res.render("profile", {'manga': manga});
});

// DOWNLOADING MANGA
async function convertToEpub(chapter_title, chapters) {
    const nodepub = require('nodepub');
    const fs = require('fs');
    const img = fs.readdirSync('./temp/manga/test/');
    let images = [];
    for (let i = 0; i < img.length; i++) {
        images.push('./temp/manga/test/' + img[i]);
    }

    console.log(img);
    console.log(images);
    const metadata = {
        id: manga.short,
        cover: './temp/image/cover.jpg',
        title: manga.title + " " + chapter_title,
        series: manga.title,
        sequence: 1,
        author: 'manga.pet.',
        fileAs: 'manga.pet.',
        genre: 'Manga',
        language: 'en',
        description: 'Manga downloaded by manga.pet.',
        showContents: false,
        contents: 'Table of Contents',
        images: images
    };
    let epub = nodepub.document(metadata);
    for (let i = 0; i < img.length; i++) {
        let  adding =
        epub.addSection('Chapter ' + i, '<img src="../images/' + i + '.jpg"/>');
    }

    // a better regex might be a good idea here
    // fixes the output string in case a strange char is in there
    let file_out = manga.title + " " + chapter_title;
    file_out = file_out.replace(/ /g,"_");
    file_out = file_out.replace(/\W/g, '')
    file_out = file_out.replace(/_/g," ");
    await epub.writeEPUB("./temp/manga_out/", file_out);

    // if file doesn't exist, create it
    fs.appendFile(logfile, '', function (err) {
        if (err) throw err;
        console.log('Saved!');
    });

    // if empty
    if (fs.readFileSync(logfile, 'utf8').length === 0) {
        // write to file
        fs.appendFile(logfile, manga.short + "," + manga.type + "," + "\n", function (err) {
            if (err) throw err;
            console.log('Updated!');
        });
    }
    else {
        // read all lines from file
        const data = fs.readFileSync(logfile, 'utf8');
        // split the contents by new line
        const lines = data.split(/\r?\n/);
        // print all lines
        let found = false;
        lines.forEach((line) => {
            // split over comma
            const parts = line.split(',');
            // print the first part
            if (parts[0] === manga.short && parts[1] === manga.type) {
                found = true;
            }
        });
        if (!found) {
            fs.appendFile(logfile, manga.short + "," + manga.type + "," + "\n", function (err) {
                if (err) throw err;
                console.log('Updated!');
            });
        }
    }
    return file_out;
}

app.get('/download', async function (req, res) {
    const type = req.query.type;
    const link = req.query.short;
    const chapter_title = req.query.title;

    try {
        if (type === 'KissManga') {
            const url = 'https://kissmanga.org/chapter/' + manga.short + "/" + link;
            await scrapeMangaChapter(url);
            const file = await convertToEpub(chapter_title);
            console.log(file, " is the file");
            await sendEmail(file).then(() => {
                console.log("Email sent");
            }).catch((error) => {
                console.log(error);
            });
        }
    } catch (e) {
        console.log(e);
    }

    console.log(type, link);
    res.render("profile", {'manga': manga});
});

app.post('/settings_set', async function (req, res) {
    console.log(req);
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));
    app.use(express.json());       // to support JSON-encoded bodies
    app.use(express.urlencoded()); // to support URL-encoded bodies

    const gmail = req.body.gmail;
    const pass = req.body.pass;
    const kindle = req.body.kindle;

    // if all are not empty and valid
    if (gmail && pass && kindle) {
        // if empty
        if (fs.readFileSync("./.cred", 'utf8').length === 0) {
            // write to file
            await fs.appendFile("./.cred", gmail + "," + pass + "," + kindle + "\n", function (err) {
                if (err) throw err;
                console.log('Updated!');
            });
        } else {
            // delete file
            await fs.unlinkSync("./.cred");
            // create empty
            await fs.appendFile("./.cred", '', function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
            // write creds to file
            await fs.appendFile("./.cred", gmail + "," + pass + "," + kindle + "\n", function (err) {
                if (err) throw err;
                console.log('Updated!');
            });
        }
    }

    console.log(gmail, pass, kindle);

    message = "Your credentials have been saved. You can now download manga.";
    res.render("settings", {
        'message': message,
        'gmail': gmail,
        'pass': pass,
        'kindle': kindle
    });
});

app.get('/progress', function (req, res) {
    res.send({'progress': getProgress()});
});

async function getCreds() {
    // read the first line of the file
    const data = fs.readFileSync("./.cred", 'utf8');

    // split the contents by new line
    const lines = data.split(/\r?\n/);
    const parts = lines[0].split(',');

    // the first line is the creds
    return {'gmail': parts[0], 'pass': parts[1], 'kindle': parts[2]};
}

app.get('/settings', async function (req, res) {

    const creds = await getCreds();
    res.render("settings", {
        'message': message,
        'gmail': creds.gmail,
        'pass': creds.pass,
        'kindle': creds.kindle
    });
    message = "";
});


const server = app.listen(0, () => {
    console.log('Running client on port:', server.address().port);
})

let port = server.address().port
module.exports = {port, getCreds};