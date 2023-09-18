const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require('fs');

//image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

//Inster an user into database route
router.post("/add", upload, async (req, res) => {
  try {
    console.log("data added1");
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });
    console.log("data added");
    // Use await to save the user data and handle any potential errors
    await user.save();

    req.session.message = {
      type: "success",
      message: "User added Successfully!",
    };
    res.redirect("/");
  } catch (err) {
    console.error("**Error reported:**", err);
    res.json({ message: err.message, type: "danger" });
  }
});
/*
router.get("/", (req, res) => {
  res.render("index", { title: "Home Page" });
});*/

router.get("/search", (req, res) => {
  res.send("Search Page");
});

//get all users route
router.get("/", async (req, res) => {
    try {
      const users = await User.find().exec();
      res.render('index', {
        title: 'Home Page',
        users: users
      });
    } catch (err) {
      res.json({ message: err.message });
    }
  });

// Edit a user route
router.get("/edit/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findById(id);
  
      if (!user) {
        return res.redirect('/');
      }
  
      res.render('edit_user', {
        title: "Edit User",
        user: user
      });
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  });  

// Update a user route
router.post('/update/:id', upload, async (req, res) => {
    try {
      const id = req.params.id;
      let newImage = '';
  
      if (req.file) {
        newImage = req.file.filename;
  
        // Delete the old image if it exists
        try {
          fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
          console.log(err);
        }
      } else {
        newImage = req.body.old_image;
      }
  
      const updatedUserData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: newImage,
      };
  
      const user = await User.findByIdAndUpdate(id, updatedUserData);
  
      if (!user) {
        return res.json({ message: 'User not found', type: 'danger' });
      }
  
      req.session.message = {
        type: 'success',
        message: 'User updated successfully',
      };
  
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.json({ message: err.message, type: 'danger' });
    }
  });


// Delete a user route
router.get('/delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      // Find the user by ID
      const user = await User.findById(id);
  
      if (!user) {
        return res.json({ message: 'User not found', type: 'danger' });
      }
  
      // Delete the user's image (if it exists)
      if (user.image) {
        fs.unlinkSync('./uploads/' + user.image);
      }
  
      // Delete the user from the database
      await User.findByIdAndRemove(id);
  
      req.session.message = {
        type: 'success',
        message: 'User deleted successfully',
      };
  
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.json({ message: err.message, type: 'danger' });
    }
  });
  

router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});
 
module.exports = router;
