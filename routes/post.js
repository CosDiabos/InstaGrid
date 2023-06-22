const multer = require('multer')
const express = require('express')
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const app = require('../index')

router = express.Router()
sharp.cache(false);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      try {
        if (!fs.existsSync(path.dirname(__dirname) + '/UI/dist/uploads/' + req.body.uuid)) {
          fs.mkdirSync(path.dirname(__dirname) + '/UI/dist/uploads/' + req.body.uuid);
        }
      }
      catch (e) {
        console.log("Error existsSync")
        console.log(e)
      } 
      cb(null, path.dirname(__dirname) + '/UI/dist/uploads/' + req.body.uuid)
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

router.post('/upload', (req, res) => {
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

router.post('/editImage', (req, res) => {
    new Promise(async (resolve, reject) => {
        // cb(null, path.dirname(__dirname) + '/UI/dist/')
        // try {
        //     .rotate(33, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        //     .toFile("sammy-rotated.png");
        // } catch (error) {
        //   console.log(error);
        // }
      try {
        // console.log(req.body);
        // console.log("path to img:" + path.dirname(__dirname) + '/UI/dist/' + req.body.file);
          const EditingImage = await sharp(path.dirname(__dirname) + '/UI/dist/' + req.body.file)
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
              fs.writeFile(path.dirname(__dirname) + '/UI/dist/' + req.body.file, buffer, function(e) {
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

router.post('/delImage', (req, res) => {
  // cb(null, path.dirname(__dirname) + '/UI/dist/')
  try {
    fs.unlinkSync(path.dirname(__dirname) + '/UI/dist/' + req.body.file)
    res.status(200).send("OK");
  } catch (error) {
    console.log("/delImage Error", error);
    res.status(400).send(error);
  }
});


router.post('/export', (req, res) => {
  // create a file to stream archive data to.
  let zipFile = 'instagrid-' + Date.now() + '.zip';
  const output = fs.createWriteStream(path.dirname(__dirname) + '/UI/dist/' + zipFile);
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
        archive.routerend('', { name: i+'/.keep' });
        folder = true;
      }
      archive.file(path.dirname(__dirname) + '/UI/dist/uploads/' + req.body.uuid + '/'+ req.body.files[i].file[ii].file, { name: i + "/" + ii+"_"+req.body.files[i].file[ii].file });
      
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
    archive.routerend(infoFile, { name: i+'/info.txt' });
  }
  let readMeFile = `
Hello! :) This is your exported feed. The posts were exported from the bottom to the top of the scheduled feed.
Each post was splitted into their own folder by posting order (0 = first, 1 = second, and so forth).
Inside each folder there is a info.txt file which contains the post content (Caption, Location, etc.) in order to publish it.`
  archive.routerend(readMeFile, { name: 'ReadMe.txt' });
  archive.finalize()
  res.status(200).json({zip: zipFile})
});

router.post('/prevImage/:deg', (req, res) => {
  // cb(null, path.dirname(__dirname) + '/UI/dist/')
  if (isNaN(req.params.deg)) {
    res.status(400).send("");
    return;
  } else {
    deg = req.params.deg;
    new Promise(async (resolve, reject) => {
      try {
          const EditingImage = await sharp(path.dirname(__dirname) + '/UI/dist/' + req.body.file)
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



router.post('/saveProject', (req, res) => {
  // cb(null, path.dirname(__dirname) + '/UI/dist/')
  fs.writeFile(path.dirname(__dirname) + '/projects/' + req.body.name + ".json", req.body.profile, err => {
    if (err) {
      console.error(err);
      res.status(400).json(err);
    }
    // file written successfully
    res.status(200).send("OK");
  });
});

module.exports = router