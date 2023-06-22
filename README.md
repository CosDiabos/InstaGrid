 

# InstaGrid
InstaGrid is a post planning tool for Instagram. It was developed to be ran locally. This tool was born in one of my last workplaces due to a colleague's necessity of planning and changing a forecast of our clients social media profiles easily. The first version of this tool was created and used a few years ago and it consisted of PHP + HTML/CSS + jQuery/Ajax. However, I decided to update the project to a more modern stack. This repo contains an updated version of the initial tool with a few improvements.

This app is divided in two parts, back-end and front-end. The front-end section is contained within the [UI/](UI/) folder and the back-end is contained in the repo root controlled by [index.js](index.js)


## How it works

The app scrapes a profile directly from Instagram website (not through the official API). This scrapper retrieves the following: username, # posts, # followers, # following, bio, highlights, profile picture and the latest 6 posts. (Bear in mind that private accounts won't be able to be scrapped publicly, you will have to login)
The app mimics the UI layout of Instagram with the scrapped information, to give a richer context for the user planning future posts. There's no need to actually scrape a profile in order to use the tool, it may be visually less interesting but it's still functional nonetheless.

The scrapping is done through Puppeteer which provides a high-level API to control a Chromium instance over the DevTools Protocol. 

## Tech Stack

Front-end

- [Vue](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind](https://tailwindcss.com/)
- [Tailwind Elements](https://tailwind-elements.com/)
- [Axios](https://axios-http.com/) + Form Data

Back-end

- Node.JS
- [Sharp](https://sharp.pixelplumbing.com/)
- [Puppeteer](https://pptr.dev/)
- [Multer](https://github.com/expressjs/multer)
- [Express](https://github.com/expressjs/express)


## How to run it

Install all dependencies in the repo root and inside [UI/](UI/) folder with ```npm install``` inside each folder.

In order to the app to run the Vue UI must be built beforehand.

```
cd UI/
npm run build
```

After successfully build the UI, go back to the repo folder root, run ```node index.js``` and follow the Terminal / Console / CLI instructions.


## Features

- Scrapping of profile info + last 6 posts;
- Save on-going planning locally;
- Single image posts or galleries;
- Login IG account;
- 2FA handling (through Terminal / Console / CLI) if the user trying to login has 2FA activated;
- Drag and Drop planned posts for ease of planning;
- Cronologically export future posts;
- Edit images (Rotate, Flip, Crop).


## Known limitations

- Current functionality limited to images (JPG, PNG, GIF);
- No automatic posting;
- Some scrapped thumbnails (mainly from Reels) aren't correctly sized.


## License
Released under GPL-v3.

© Jéssica Pereira —> 2017 - 2023
