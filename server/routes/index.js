//Authors: Sabir Buxsoo, Daniel Vorster, Sheldon Reay
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const multer  = require('multer');
var path = require('path')

//These are all the API Routes that are used and consumed by both the App and the Dashboard.


// SET STORAGE
// For Picture Upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/var/www/dulwich.dlinkddns.com/html/api2/server/public/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  })
   
  var upload = multer({ storage: storage })



//Get all users
//In Case Routes need to be protected
// router.get('/users', verifyToken, async(req, res, next) => {
//     jwt.verify(req.token, 'secretkey', async(err, authData) =>{
//         if(err){
//             res.sendStatus("You Need JWT bra");
//         }else{
//             try{
//                 let results = await db.all();
//                 res.json(results);
//             }catch(e){
//                 console.log(e);
//                 res.sendStatus("Nub got SQL error.");
//             }
//         }
//     });
// });


//Get list of users from database
router.get('/users', async(req, res, next) => {
    try{
        let results = await db.all();
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus("Nub got SQL error.");
    }
});


//Get specific user
router.get('/users/:id', async(req, res, next) => {
    try{
        let results = await db.one(req.params.id);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Delete Specific User
router.post('/users/delete', async(req, res, next) => {
    try{
        let results = await db.del(req.body.user_id);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Register User
router.post('/users/register', async(req, res, next) => {
    try{
        let results = await db.addUser(req.body);
        res.send(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Login User
router.post('/users/login', async(req, res, next) => {
    try{
        let results = await db.login(req.body);
        let user = req.body.email;
        if(results.loggedIn === true){
            
            jwt.sign({user}, 'secretkey', (err, token) => {
                results.authToken = token;
                res.send(results);
            });
        }else{
                res.send(results);
        }
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Get all posts
router.post('/posts', async(req, res, next) => {
    try{
        let results = await db.allPosts(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Get all posts for API
router.post('/allPosts', async(req, res, next) => {

    try{
        let results = await db.fetchAllPosts(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Get specific post
router.get('/posts/:id', async(req, res, next) => {
    try{
        let results = await db.onePost(req.params.id);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Add Post
router.post('/posts/add', async(req, res, next) => {
    try{
        let results = await db.addPost(req.body);
        res.send(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Delete Specific Post
router.post('/posts/delete', async(req, res, next) => {
    try{
        let results = await db.delPost(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Admin Delete post
router.post('/posts/adminDel', async(req, res, next) => {
    try{
        let results = await db.delPostAdmin(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Verify Token
// function verifyToken(req, res, next){
//     //Get Auth Header Value
//     const bearerHeader = req.headers['authorization'];
    
//     //Check is bearer is undefined
//     if(typeof bearerHeader !== 'undefined'){
//         //Split at space
//         const bearer = bearerHeader.split(" ");
//         //Get Token from Array
//         const bearerToken = bearer[1];
//         //Set the token
//         req.token = bearerToken;

//         //Next Middleware
//         next();
//     }else{
//         //Forbidden
//         res.send("You need JWT to access, bra!");
//     }
// }


//Get all locations
router.get('/locations', async(req, res, next) => {
    try{
        let results = await db.allLocations();
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Add User Location
router.post('/setLocations', async(req, res, next) => {
    try{
        let results = await db.setLocations(req.body);
        res.send(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Get user specified locations
router.post('/userLocations', async(req, res, next) => {
    try{
        let results = await db.userLocations(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Flag Post
router.post('/flagPost', async(req, res, next) => {
    try{
        let results = await db.flagPost(req.body);
        res.send(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Unflag post
router.post('/unflagPost', async(req, res, next) => {
    try{
        let results = await db.unflagPost(req.body);
        res.send(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Post Count
router.get('/postCount', async(req, res, next) => {
    try{
        let results = await db.postCount();
        res.send(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Add Post with Image 
router.post('/upload', upload.single('image'), async(req, res, next) => {
    const file = req.file
    if (!file) {
        try{
            req.body["photo_uri"] = 'http://dulwich.dlinkddns.com/api2/server/public/image-1567944166535.jpeg';
            let results = await db.addPost(req.body);
            res.send("Photo added. Data Inserted. We eating' good." + JSON.stringify(req.body["photo_uri"]));
        }catch(e){
            console.log(e);
            res.sendStatus(500);
        }
    }else{
        try{
            req.body["photo_uri"] = 'http://dulwich.dlinkddns.com/api2/server/public/' + file.filename;
            let results = await db.addPost(req.body);
            res.send("Photo added. Data Inserted. We eating' good." + JSON.stringify(req.body["photo_uri"]));
        }catch(e){
            console.log(e);
            res.sendStatus(500);
        }
    }    
  })



  //Get all events
router.get('/events', async(req, res, next) => {
    try{
        let results = await db.allEvents(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Add Event
router.post('/events/add', upload.single('image'), async(req, res, next) => {
    const file = req.file
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
    try{
        req.body["photo_uri"] = 'http://dulwich.dlinkddns.com/api2/server/public/' + file.filename;
        let results = await db.addEvent(req.body);
        res.send("Photo added. Data Inserted. We eating' good." + JSON.stringify(req.body["photo_uri"]));
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
  })



//Delete Specific Event
router.post('/events/delete', async(req, res, next) => {
    try{
        let results = await db.delEvent(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Delete Specific Event from Admin dashboard
router.post('/events/adminDel', async(req, res, next) => {
    try{
        let results = await db.delEventAdmin(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Get all posts for current month and store in array
//Used for charts
router.get('/monthPosts', async(req, res, next) => {
    try{
        let results = await db.monthPosts();
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Get all users registered in current month and store in array
//Used for charts
router.get('/monthUsers', async(req, res, next) => {
    try{
        let results = await db.monthUsers();
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus("Nub got SQL error.");
    }
});


//Get all Events for User Selected Locations
router.post('/userEvents', async(req, res, next) => {
    try{
        let results = await db.allUserEvents(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//RSVP to Event
router.post('/events/rsvp', async(req, res, next) => {
    try{
        let results = await db.rsvp(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//UnRSVP to event
router.post('/events/unrsvp',async(req, res, next) => {
    try{
        let results = await db.unrsvp(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Check Attending
router.post('/events/isAttending', async(req, res, next) => {
    try{
        let results = await db.isAttending(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Get all Events attendees for user selected location
router.post('/events/attendees', async(req, res, next) => {
    try{
        let results = await db.attendees(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Approve Events (for Admin Dashboard)
router.post('/events/approve', async(req, res, next) => {

    try{
        let results = await db.approveEvent(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Unapprove Events (Admin Dashboard)
router.post('/events/unapprove', async(req, res, next) => {
    try{
        let results = await db.unapproveEvent(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Get pieChart data for flagged posts
router.get('/pieData', async(req, res, next) => {
    try{
        let results = await db.pieData(req.body);
        res.json(results);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});
module.exports = router;




