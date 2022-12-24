const { app, BrowserWindow } = require('electron')
const path = require('path')
const {sendEmail} = require("./src/mail");
const {scrapeMangaProfile, scrapeMangaSearch, scrapeMangaChapter} = require("./src/scraper");

const {port} = require('./app.js')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'src/256x256.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
//  win.loadFile('index.ejs')
  win.loadURL('http://localhost:' + String(port))
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
// https://kissmanga.org/manga_list?q=clannad&action=search
// const url = 'https://kissmanga.org/manga/manga-hc959911';

//let express = require('express');

let http = require('http');
let nodemailer = require('nodemailer');
const {response} = require("express");

//let ex_app = express();
//const router = express.Router();


// sendEmail().catch(console.error);