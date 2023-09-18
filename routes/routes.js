const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');

//image upload 
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname+ "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single("image");

//Inster an user into database route
router.post('/add', upload, async (req, res) => {
    try {
        console.log("data added1");
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename
        });
console.log("data added");
        // Use await to save the user data and handle any potential errors
        await user.save();

        req.session.message = {
            
            type: 'success',
            message: 'User added Successfully!'
        };
        res.redirect('/');
    } catch (err) {
        console.error("**Error reported:**", err);
        res.json({ message: err.message, type: 'danger' });
    }
});


router.get("/", (req,res) =>{
    res.render('index', {title: "Home Page"});
});

router.get("/search", (req,res) =>{
    res.send("Search Page");
});

//get all users route
/*
router.get("/add", (req,res)=>{
    User.find().exec((err,users)=>{
        if(err){
            res.json({message: err.message});
        } else{
            res.render('index',{
                title: 'Home Page',
                users: users
            });
        }
    })
}) */

router.get("/add", (req,res) =>{
    res.render("add_users", {title: "Add Users"});
});

module.exports = router;