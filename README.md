# manga.pet.

An application to download, convert and send manga to your kindle. It is my own replacement for kmanga.net, which has been taken down.

## What does it do
* scrapes KissManga.org to find the manga you want
* downloads the images and converts them to an epub
* sends the epub via email to your kindle
  
All with just a few clicks.

## Notes on usage
Before you start using manga.pet. you should:
* set up your gmail credentials in the settings
  * you will have to create an app password for your gmail [guide](https://support.google.com/accounts/answer/185833?hl=en)
  * as this will put all of your emails behind an insecure app password, I HIGHLY recommend creating a separate google account to use this tool with
* whitelist your gmail address in your amazon account [guide](https://www.amazon.com/gp/help/customer/display.html?nodeId=GX9XLEVV8G4DB28H).
  * otherwise your kindle won't accept the email

## Installation
You can opt to use the prebuilt windows binary in the releases section.

If you wish to prepare the binary yourself, install all dependencies with npm  
> npm install

And run with 
> yarn start

To build executables for windows or linux, run on the respective platform. Currently only support arch linux and windows, [here](https://www.electron.build/configuration/linux) is how to write your own build routine for other distributions.
> yarn dist

The installer will be generated into the dist directory.

The project is also set up with electron forge.

![Main](screenshots/main.png)
![Manga](screenshots/manga.png)
