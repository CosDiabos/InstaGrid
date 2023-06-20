// const Insta = require('scraper-instagram');
// const InstaClient = new Insta();
// const request = require('request');

// const opts = {
// 	headers: {'Content-Type': 'text/plain', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'}
// }
// opts.url = 'https://www.instagram.com/cosdiabos';
// request('http://instagram.com/cosdiabos', function (error, response, body) {
//   // console.error('error:', error); // Print the error if one occurred
//   // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   console.log('body:', body); // Print the HTML for the Google homepage.
// });
// // InstaClient.authBySessionId("2238098080%3Am3ZIv3oMAySpFr%3A20%3AAYeGfD35IKCkaqPgW7_mjqT-SrIzA1qooTbOzUD0PQ")
// // 	.then(account => console.log(account))
// // 	.catch(err => console.error(err));
// // InstaClient.getProfile("cosdiabos")
// //       .then(profile => console.log(profile))
// //       .catch(err => console.log("Err:" + err));

const Browser = require('zombie');

// We're going to make requests to http://example.com/signup
// Which will be routed to our test server localhost:3000
// Browser.site = 'http://0.0.0.0:3000';
Browser.localhost('instagram.com', process.env.PORT || 3000);
// Browser.localhost('localhost:8888', process.env.PORT || 3000);
const browser = new Browser();
browser.debug();

browser.on('event', function(event, target) {
  console.log("On");
  console.log(event);
  console.log("target");
  // console.log(target);
});
  
function done(e) {
    console.log("Loaded!");
    console.log("URL: " + browser.location.href);
    // console.log(e);
    // browser.assert.success();
  }

 
   // browser.visit('/cosdiabos', done);
// describe('User visits signup page', function() {

while (true) {
  browser.visit('/', done);
}

  
  // console.log(browser.tabs);  

//   describe('submits form', function() {

//     before(function(done) {
//       browser.fill('email', 'zombie@underworld.dead')
//       .then(() => browser.fill('password', 'eat-the-living'))
//       .then(() => browser.pressButton('Sign Me Up!', done));
//     });

//     it('should be successful', function() {
//       browser.assert.success();
//     });

//     it('should see welcome page', function() {
//       browser.assert.text('title', 'Welcome To Brains Depot');
//     });
//   });
// });