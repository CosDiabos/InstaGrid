const fs = require('fs');
const path = require('path');
const express = require('express')
const app = require('../index')

router = express.Router()

router.get('/loadProject/:name', (req, res) => {
  // cb(null, __dirname + '/UI/dist/')
  fs.readFile(path.dirname(__dirname) + '/projects/' + req.params.name + ".json", 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(400).json(err);
    }
    // file written successfully
    res.status(200).json(JSON.parse(data));
  });
});

router.get('/getProjects', (req, res) => {
  // cb(null, __dirname + '/UI/dist/')
  fs.readdir(path.dirname(__dirname) + '/projects/', (err, files) => {
    var projs = []
    files.forEach(file => {
      if (path.extname(file).toLowerCase() == ".json") {
        projs.push(file);
      }
    });
    res.status(200).json(projs);
  });
});


var handle = "";

router.get('/fetch/:handle', (req, res) => {
    
    new Promise(async (resolve, reject) => {
        try {
          if (logged == false) {
            handle = req.params.handle;
            login();
            await res.json("");
          }  else {
            var p = await fetch(req.params.handle);
            await res.json(p);
            // fs.writeFileSync(__dirname + '/imagesPosts.json', JSON.stringify(imagesPosts));
            // console.log(imagesPosts);
          }
          return resolve(req);
    } catch(e) {
      console.log("Error! " + e);
      return reject(e);
    }
  });
})

router.get('/data/:handle', (req, res) => {
    
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

module.exports = router