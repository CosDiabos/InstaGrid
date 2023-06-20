const express = require('express')
const cors = require('cors')
const multer = require('multer')
const app = express()
const puppeteer = require('puppeteer');
const readline = require("readline");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const body_parser = require('body-parser');
const archiver = require('archiver');

sharp.cache(false);

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

var logged = true;
var acc = {
  user:"cosdiabos",
  pass:"Tv3FJTyuOO7Wg6"
}

app.use(express.json({limit:"1mb"}));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log(req.body)
      try {
        if (!fs.existsSync(__dirname + '/UI/dist/uploads/' + req.body.uuid)) {
          fs.mkdirSync(__dirname + '/UI/dist/uploads/' + req.body.uuid);
        }
      }
      catch (e) {

      } 
      cb(null, __dirname + '/UI/dist/uploads/' + req.body.uuid)
    },
    filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + file.originalname.match(/\..*$/)[0])
    }
});

const multi_upload = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg format allowed!')
            err.name = 'ExtensionError'
            return cb(err);
        }
    },
}).array('img', 6)

app.post('/upload', (req, res) => {
multi_upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            res.status(500).send({ error: { message: `Multer uploading error: ${err.message}` } });
            return;
        } else if (err) {
            // An unknown error occurred when uploading.
            if (err.name == 'ExtensionError') {
                res.status(413).send({ error: { message: err.message } });
            } else {
                res.status(500).send({ error: { message: `unknown uploading error: ${err.message}` } });
            }
            return;
        }
        // Everything went fine.
        // show file `req.files`
        // show body `req.body`
        let rpl = {
          index:req.body.index,
          files:[]
        };
        for (var i = 0; i < req.files.length; i++) {
          rpl.files.push({
            file:req.files[i].filename 
          })
        }
        console.log(rpl)
        res.status(200).json(rpl);
    })
});

app.post('/editImage', (req, res) => {
    new Promise(async (resolve, reject) => {
        // cb(null, __dirname + '/UI/dist/')
        // try {
        //     .rotate(33, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        //     .toFile("sammy-rotated.png");
        // } catch (error) {
        //   console.log(error);
        // }
      try {
        console.log(req.body);
        console.log("path to img:" + __dirname + '/UI/dist/' + req.body.file);
          const EditingImage = await sharp(__dirname + '/UI/dist/' + req.body.file)
          if (req.body.flip) {
            await EditingImage.flip();
            console.log("flipped!")
          }
          if (req.body.flop) {
            await EditingImage.flop();
            console.log("flopped!")
          }
          if (req.body.rotation != 0) {
            await EditingImage.rotate(req.body.rotation);
            console.log("rotated!")
          }
          EditingImage.toBuffer((err, buffer) => {
            if (err) {
                console.error(err);
                res.status(400).json(JSON.stringify(err));
            }
            else {
                // console.log(sh);
              fs.writeFile(__dirname + '/UI/dist/' + req.body.file, buffer, function(e) {
                res.status(200).send("OK");
              })
            }
          });
        // console.log(res)
        // res.status(200).json();
      return resolve(req)
    } catch (e) {
      console.log("/editImage Error", e);
    }

    });
});

app.post('/delImage', (req, res) => {
  // cb(null, __dirname + '/UI/dist/')
  try {
    fs.unlinkSync(__dirname + '/UI/dist/' + req.body.file)
    res.status(200).send("OK");
  } catch (error) {
    console.log("/delImage Error", error);
    res.status(400).send(error);
  }
});


app.post('/export', (req, res) => {
  // create a file to stream archive data to.
  let zipFile = 'instagrid-' + Date.now() + '.zip';
  const output = fs.createWriteStream(__dirname + '/UI/dist/' + zipFile);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });
  archive.on('error', function(err) {
    console.log("ERROR ZIP:", err);
  });
  let files = req.body.files;
  archive.pipe(output);
  for (var i = 0; i < req.body.files.length; i++) {
    req.body.files[i]
    let folder = false;
    for (var ii = 0; ii < req.body.files[i].file.length; ii++) {
      if (folder == false) {
        archive.append('', { name: i+'/.keep' });
        folder = true;
      }
      archive.file(__dirname + '/UI/dist/uploads/' + req.body.uuid + '/'+ req.body.files[i].file[ii].file, { name: i + "/" + ii+"_"+req.body.files[i].file[ii].file });
      
    }
    /* Prevent undefined in 'info.txt' if any of these fields
    aren't sent by the front-end */
    req.body.files[i].caption ??="";
    req.body.files[i].location ??="";
    req.body.files[i].date ??="";
    req.body.files[i].notes ??="";

let infoFile = `
Caption:
${req.body.files[i].caption}
Location:
${req.body.files[i].location}
Date:
${req.body.files[i].date}
Notes:
${req.body.files[i].notes}
`;
    archive.append(infoFile, { name: i+'/info.txt' });
  }
  let readMeFile = `
Hello! :) This is your exported feed. The posts were exported from the bottom to the top of the scheduled feed.
Each post was splitted into their own folder by posting order (0 = first, 1 = second, and so forth).
Inside each folder there is a info.txt file which contains the post content (Caption, Location, etc.) in order to publish it.`
  archive.append(readMeFile, { name: 'ReadMe.txt' });
  archive.finalize()
  res.status(200).json({zip: zipFile})
});

app.post('/prevImage/:deg', (req, res) => {
  // cb(null, __dirname + '/UI/dist/')
  if (isNaN(req.params.deg)) {
    res.status(400).send("");
    return;
  } else {
    deg = req.params.deg;
    new Promise(async (resolve, reject) => {
      try {
          const EditingImage = await sharp(__dirname + '/UI/dist/' + req.body.file)
          await EditingImage.rotate(Number(deg));
          EditingImage.toBuffer((err, buffer) => {
            if (err) {
                console.error(err);
                res.status(400).json(JSON.stringify(err));
            }
            else {
                res.status(200).send("data:image/jpeg;base64," + buffer.toString("base64"));
            }
            });
      } catch (e) {
        console.log("/prevImage Error", e);
        res.status(400).json(e);

      }
    });
  }
});

app.get('/getProjects', (req, res) => {
  // cb(null, __dirname + '/UI/dist/')
  fs.readdir(__dirname + '/projects/', (err, files) => {
    var projs = []
    files.forEach(file => {
      if (path.extname(file).toLowerCase() == ".json") {
        projs.push(file);
      }
    });
    res.status(200).json(projs);
  });
});

app.post('/saveProject', (req, res) => {
  // cb(null, __dirname + '/UI/dist/')
  fs.writeFile(__dirname + '/projects/' + req.body.name + ".json", req.body.profile, err => {
    if (err) {
      console.error(err);
      res.status(400).json(err);
    }
    // file written successfully
    res.status(200).send("OK");
  });
});

app.get('/loadProject/:name', (req, res) => {
  // cb(null, __dirname + '/UI/dist/')
  fs.readFile(__dirname + '/projects/' + req.params.name + ".json", 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(400).json(err);
    }
    // file written successfully
    res.status(200).json(JSON.parse(data));
  });
});

app.use('/', express.static(__dirname + '/ui/dist'));

var handle = "";

app.get('/fetch/:handle', (req, res) => {
    
    new Promise(async (resolve, reject) => {
        try {
          if (logged == false) {
            handle = req.params.handle;
            login();
            await res.json("");
          }  else {
            var p = await fetch(req.params.handle);
            await res.json(p);
            fs.writeFileSync(__dirname + '/imagesPosts.json', JSON.stringify(imagesPosts));
            // console.log(imagesPosts);
          }
          return resolve(req);
    } catch(e) {
      console.log("Error! " + e);
      return reject(e);
    }
  });
})

app.get('/data/:handle', (req, res) => {
    
    new Promise(async (resolve, reject) => {
        try {
            var p = await getData(req.params.handle);
            await res.json(p);
          return resolve(req);
    } catch(e) {
      console.log("Error! " + e);
      return reject(e);
    }
  });
})

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
  logged = true;
  fetch(handle);
  } catch (e) {
    console.log(e);
    // return reject(e);
  }

}

function fetch (h) {
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
            
            const nameEle = await page.waitForSelector('section > div._aa_c > div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1 > span._aacl._aaco._aacw._aacx._aad7._aade');
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
browser = await puppeteer.launch({headless: false, userDataDir:"./userDataDirPuppeteer"});
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
    console.log("Caught interrupt signal");
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

