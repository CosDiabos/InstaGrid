const express = require('express')
const cors = require('cors')
const app = express()
const puppeteer = require('puppeteer');
const readline = require("readline");
const fs = require('fs');
const path = require('path');
const body_parser = require('body-parser');
const archiver = require('archiver');

var routeGET = require('./routes/get')
var routePOST = require('./routes/post')



var profile = {
  username: "",
  posts: 0,
  followers:0,
  following: 0,
  PP: "",
  posting: [],
  highlights: []
};

var imagesPosts = [];

global.logged = true;
var acc = {
  user:"IG_username",
  pass:"IG_pw"
}

app.use(express.json({limit:"1mb"}));
app.use(express.urlencoded({ limit: "1mb", extended: true }));



app.use('/', express.static(__dirname + '/ui/dist'));

app.use('/', routeGET);
app.use('/', routePOST);


function login() {
  return new Promise(async (resolve, reject) => {
    try {

        resp = await page.goto('https://www.instagram.com',{waitUntil: 'domcontentloaded'});
        // resp = await page.goto('http://localhost:3000/login',{waitUntil: 'domcontentloaded'});

        // Bypass cookie dialog
        await page.waitForSelector('button._a9--');
        await page.click('button._a9--');
        
        await page.waitForSelector('input[name="username"]');
        await page.focus('input[name="username"]');
        await page.keyboard.type(acc.user);
        await page.focus('input[name="password"]');
        await page.keyboard.type(acc.pass);
        await page.waitForSelector('button[type="submit"]');
        await page.focus('button[type="submit"]');
        await page.click('button[type="submit"]');
       
        // resp = await page.goto('http://www.google.com',{waitUntil: 'domcontentloaded'});
        // await page.click('#W0wltc');
        // await page.waitForSelector('textarea');
        // await page.focus('textarea');
        // await page.keyboard.type(acc.user);
        // await page.click('input[name="btnK"]');

        await page.waitForNavigation({waitUntil: 'domcontentloaded'});
        console.log("navigated!");

        let fa = await page.evaluate(()=>{return window.location.href });
        switch(fa) {
          case 'https://www.instagram.com/accounts/login/two_factor?next=%2F':
          case 'http://localhost:3000/accounts/login/two_factor/?next=%2F':
            console.log("Case!");
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            console.log("Seems like you have 2FA activated in your IG account. To proceed with the login, please, type in the token.");
            // request two-factor code
            rl.question("2FA Token: ", tkn => {
              token = tkn;
              console.log("Your response was: " + token + " — Thanks!");
              rl.close();
              new Promise(async (resolve, reject) => {
                try {
                  await post2FA(token);
                } catch (e) {return reject(e);}
              });
            });
            break;
          }


        // 2FA request
        // at https://www.instagram.com/accounts/login/two_factor
        // const chain = resp.request().redirectChain();
        // console.log("Redirected: " + chain.length + "times!");
        // for (var i = 0; i < chain.length; i++) {
        //   console.log(chain[i].url());
        // }
        // console.log("gotta login!");
        return resolve(page);
      } catch (e) {
        return reject(e);
      }
});
}

async function post2FA(token) {
  try {

  await console.log("Attempting 2FA...")
  await page.waitForSelector('input[name="verificationCode"]');
  await page.focus('input[name="verificationCode"]');
  await page.keyboard.type(token);
  await page.waitForSelector('button');
  await page.click('button');
  await page.waitForNavigation({waitUntil: 'domcontentloaded'}); // ??
  await console.log("Valid 2FA!");
  global.logged = true;
  fetch(handle);
  } catch (e) {
    console.log(e);
    // return reject(e);
  }

}

global.fetch = function fetch (h) {
  console.log("Fetching profile: " + h);
    return new Promise(async (resolve, reject) => {
        try {
          // {headless: false}
            // const browser = await puppeteer.launch({headless: false});
            // const page = await browser.newPage();
            await page.goto('https://www.instagram.com/' + h, { waitUntil: "domcontentloaded" });

            try {
              // Bypass cookie dialog
              await page.waitForSelector('button._a9--', { timeout: 3000 });
              await page.click('button._a9--');
            } catch (e) { console.log("Closing cookie popup failed. Maybe already handled.");}

            const PPEle = await page.waitForSelector('header img');
            profile.PP = await PPEle.evaluate(el => el.src, PPEle);

            const usernameEle = await page.waitForSelector('h2');
            profile.username = await usernameEle.evaluate(el => el.textContent, usernameEle);

            const postsEle = await page.waitForSelector('section ul li:nth-child(1) span');
            profile.posts = await postsEle.evaluate(el => el.textContent, postsEle);

            const followersEle = await page.waitForSelector('section ul li:nth-child(2) span');
            profile.followers = await followersEle.evaluate(el => el.textContent, followersEle);

            const followingEle = await page.waitForSelector('section ul li:nth-child(3) span');
            profile.following = await followingEle.evaluate(el => el.textContent, followingEle);
            
            const nameEle = await page.waitForSelector('section > div._aa_c > div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1 > span');
            profile.name = await nameEle.evaluate(el => el.textContent, nameEle);

            const bioEle = await page.waitForSelector('section h1');
            profile.bio = await bioEle.evaluate(el => el.textContent, bioEle);
            
            postImgEle = await page.waitForSelector('article a', { timeout: 3000 });
            postImgEle = await page.$$('article a img');

            highlightsEle = await page.waitForSelector('ul._acay li._acaz', { timeout: 6000 });
            highlightsEle = await page.$('ul._acay')
            highlightsEle2 = await highlightsEle.$$eval('li._acaz', (highs) => {
              return highs.map(high => {
                imgg = high.querySelector('img')
                capt = high.querySelector('span > span');
                const toText = (el) => el && el.innerText.trim();
                return {
                  file: imgg.src,
                  caption: toText(capt)
                }
              });
            });
            profile.highlights = highlightsEle2;
            let count = 0;
            let posts = [];
            for (let node of postImgEle) {
              if (count == 6) {
                break;
              } else {
                count ++;
              }
              let postt = await node.getProperty('src');
              let url = await postt.jsonValue()
              // console.log("Filter length: ");
              // console.log(a.length);
              posts.push({
                file: [{file: url}]
              });
            }
            profile.posting = posts;

            a = imagesPosts.filter(obj => {
                // console.log(obj);
                if (obj.url.substring(0,obj.url.indexOf('?')) == profile.PP.substring(0,profile.PP.indexOf('?'))) {
                //console.log("found! ", obj)
                  return obj
                } else {
                return undefined
                }
              });
            if (a.length > 0) {
              profile.PP = a[a.length-1].file
              console.log("PP updated!")
            }

            profile.posting.forEach(e => {
              a = imagesPosts.filter(obj => {
                if (obj.url.substring(0,obj.url.indexOf('?')) == e.file[0].file.substring(0,e.file[0].file.indexOf('?'))) {
                //console.log("found! ", obj)
                  return obj
                } else {
                return undefined
                }
              });
              e.file[0].file = a[a.length-1].file
            });


            for (let highlight in profile.highlights) {
              a = imagesPosts.filter(obj => {
                  if (obj.url.substring(0,obj.url.indexOf('?')) == profile.highlights[highlight].file.substring(0,profile.highlights[highlight].file.indexOf('?'))) {
                    //console.log("found! ", obj)
                    return obj
                  } else {
                    return undefined
                  }
                })
              if (a.length > 0) {
                console.log(a.length);
                profile.highlights[highlight].file = a[a.length-1].file;  
              }
            }

            // browser.close();
            return resolve(profile);
        } catch (e) {
            return reject(e);
        }
    })
}
const ask2FAToken = () => new Promise((resolve) => rl.question("2FA Token: ", resolve));

var browser, page;
new Promise(async (resolve, reject) => {
browser = await puppeteer.launch({headless: true, userDataDir:"./userDataDirPuppeteer"});
page = await browser.newPage();
await page.goto('http://localhost:3000');
// page.setDefaultNavigationTimeout(0);
page.setRequestInterception(true);
page.on('request', async (request) => {
  // Capture any request that is a navigation requests that attempts to load a new document
  // This will capture HTTP Status 301, 302, 303, 307, 308, HTML, and Javascript redirects    
  if (request.isNavigationRequest() && request.resourceType() === 'document') {
  // console.log(request.url())
  imagesPosts = [];
  }
  request.continue()
// resolve(page);
  });

page.on('response', async (request) => {
  if (request.request().resourceType() === 'image') {
  // console.log("img!");
  // console.log(request.url());
  try {
  buffer = await request.buffer();
  // console.log("fetched!");
  imagesPosts.push({
    url: request.url(),
    file:"data:image/jpg;base64," + buffer.toString('base64')
  })
  } catch(e) {
    console.log("Error fetching buffer! " + e)
  }
  }
  });
});

process.on('SIGINT', async function() {
    console.log("Caught interrupt signal. Quitting...");
    try {
     await browser.close()
    } catch (e) {
      console.log("Error SIGINT: ", e)
    }
});

app.listen(3000, () => {
  console.log(`App listening at http://localhost:3000`);
});
//console.log("Browser set!");
// });

