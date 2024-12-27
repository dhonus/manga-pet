<div align="center" style="display:flex; flex-direction: column;">

<h1>manga.pet.</h1>


An application to download, convert and send manga to your kindle. 

</div>

## Deprecation notice !!
This app is no longer maintained. Kissmanga has been taken down and I have no plans to update this project to work with other sources. I made **a better replacement** - [kiyomi](https://github.com/dhonus/kiyomi) - which uses suwayomi or other sources to download manga from a much wider range of sources than just kissmanga.

## What does it do
It is my own replacement for kmanga.net, which has been taken down.

* scrapes KissManga.org to find the manga you want
* downloads the images and converts them to an epub
* sends the epub via email to your kindle
  
All with just a few clicks.

## Usage
Before you start using manga.pet. you should:
* set up your gmail credentials in the settings
  * you will have to create an **app password** for your gmail [guide](https://support.google.com/accounts/answer/185833?hl=en)
  * as this will put all of your emails behind an insecure app password, **I highly recommend creating a separate google account** to use this tool with
* whitelist your gmail address in your amazon account [guide](https://www.amazon.com/gp/help/customer/display.html?nodeId=GX9XLEVV8G4DB28H).
  * otherwise your kindle **won't accept the email**

## Installation
You can [download](https://github.com/dhonus/manga-pet/releases) the prebuilt windows executable in the releases section. 

If you wish to prepare the binary yourself, install all dependencies with yarn  
> yarn install

And run with 
> yarn start

To build executables for windows or linux, run on the respective platform. Currently only supports **arch linux and windows**, [here](https://www.electron.build/configuration/linux) is how to write your own build routine for other distributions.
> yarn dist

The installer will be generated into the dist directory.

The project is also set up with electron forge.

![Main](screenshots/main.png)
![Manga](screenshots/manga.png)
