module.exports = {
    scrapeMangaProfile,
    scrapeMangaSearch,
    scrapeMangaChapter,
    getProgress
};

const cheerio = require('cheerio');
const rp = require('request-promise');
const fs = require("fs");
const cp = require("child_process");

const {app}  = require('electron');
const userData = app.getPath("userData")

class Manga {
    constructor(short, title, summary, chapters, type){
        this.short = short
        this.title = title;
        this.summary = summary;
        this.chapters = chapters;
        this.type = type;
    }
}

async function scrapeMangaProfile(url){
    // check if url starts with http
    if(!url.startsWith('https://kissmanga.org/')){
        throw new Error('Invalid URL');
    }
    // get text
    let manga_short = url.substring(url.indexOf('/manga/') + 7);

    // run on a separate thread
    const ret = await rp(url)
        .then(function(html){
            //success!
            //console.log(html);
            let loaded = cheerio.load(html, null, true);
            let title = loaded('.bigChar').text();
            // let info = loaded('p.info').text();
            const summary = loaded('div.summary p').text();

            let chapters = [];
            loaded('div.listing div h3').each(function(i, elem){
                let chapter = {
                    chapter: loaded(this).find('a').text(),
                    link: loaded(this).find('a').attr('href')
                };
                // remove occurences of 'chapter' from chapter name
                // remove whitespace
                // remove newlines
                chapter.chapter = chapter.chapter.trim().replace(/\n/g, '');
                chapter.chapter = chapter.chapter.replace(/\s\s+/g, ' ');

                // remove prefix
                console.log("yay " + manga_short)
                chapter.link = chapter.link.replace('/chapter/' + manga_short + "/", '');

                console.log(chapter.link , "is the link");

                if (chapter.chapter != "" && chapter.link !== undefined){
                    chapters.push(chapter);
                }
            });

            console.log(chapters);

            return new Manga(manga_short, title, summary, chapters, 'KissManga');
        })
        .catch(function(err){
            //handle error
        });
    return ret;
}

async function scrapeMangaSearch(url){
    // check if url starts with http
    if(!url.startsWith('https://kissmanga.org/')){
        throw new Error('Invalid URL');
    }

    console.log("scraping " + url);
    const ret = await rp(url)
        .then(function(html){
            //success!
            //console.log(html);
            let loaded = cheerio.load(html, null, true);

            let mangas = [];
            loaded('div.listing div.item_movies_in_cat').each(function(i, elem){
                let manga = {
                    manga: loaded(this).find('div a.item_movies_link').text(),
                    link: loaded(this).find('div a.item_movies_link').attr('href'),
                    img: loaded(this).find('div a.item_movies_link').attr('href')
                };
                // remove occurences of 'chapter' from chapter name
                // remove whitespace
                // remove newlines
                manga.manga = manga.manga.trim().replace(/\n/g, '');
                manga.manga = manga.manga.replace(/\s\s+/g, ' ');

                // remove prefix
                manga.link = manga.link.replace('/manga/', '');
                // construct link
                manga.link = '?type=KissManga&link=' + manga.link;

                if (manga.manga != "" && manga.link !== undefined){
                    mangas.push(manga);
                }
            });

            console.log(mangas);
            return mangas;
        })
        .catch(function(err){
            //handle error
        });
    return ret;
}

async function download(manga, manga_name){
    //check if manga ends with .jpg
    let extension;
    if(manga.manga.endsWith('.jpg')){
        extension = '.jpg';
    } else if (!manga.manga.endsWith('.png')){
        extension = '.png';
    } else {
        throw new Error('Invalid image type');
    }
    console.log(manga.order);
    let command = `curl -o ` + userData + `/temp/manga/${manga_name}/${manga.order}${extension}  ${manga.manga}`;
    console.log(command);
    let result = cp.execSync(command);
}

let progress = 0;
function getProgress(){
    return progress;
}
async function scrapeMangaChapter(url){
    // check if url starts with http
    if(!url.startsWith('https://kissmanga.org/')){
        throw new Error('Invalid URL');
    }

    console.log("scraping " + url);

    // displaying progress for the user
    progress = 0;
    const manga_name = 'test';
    let mangas = [];
    const ret = await rp(url)
        .then(async function(html){
            //success!
            //console.log(html);
            let loaded = cheerio.load(html, null, true);

            let i = 0;
            loaded('div.watch_container #centerDivVideo img').each(function(i, elem){
                let manga = {
                    manga: loaded(this).attr('src'),
                    order: i
                };
                i++;
                if (manga.manga != ''){
                    mangas.push(manga);
                }
            });

            console.log(mangas);

            try {
                await fs.rmSync(userData + '/temp/manga/' + manga_name, { recursive: true });
            } catch (e) {
                console.log("Probably no temp/image folder. This should be fine.");
            }
            fs.mkdirSync(userData + '/temp/manga/' + manga_name, { recursive: true });
            // for each manga in mangas
            total = mangas.length;
            for (let i = 0; i < mangas.length; i++){
                await download(mangas[i], manga_name);
                progress++;
                console.log("Downloaded " + mangas[i].manga + " of " + mangas.length);
            }
            return mangas;
        })
        .catch(function(err){
            //handle error
        });

    return ret;
}