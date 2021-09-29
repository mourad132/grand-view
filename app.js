// Notes:
// -----
// Any Routes Ends With ( * ) the user have to be authenticated to access it


//Node Modules
var express = require("express");
const sanitizer  = require('sanitizer');
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
var passport = require("passport");
var methodOverride = require("method-override");
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
var passportLocalMongoose = require("passport-local-mongoose");
var localStrategy = require("passport-local").Strategy;
var app = express();

//Local Models
var { ensureAuthenticated } = require("./config/auth.js");
var Post = require("./models/post.js")
var User = require('./models/User.js')
const Comment = require("./models/comments.js");
const Suggestion = require("./models/suggestion.js");

//Mongoose Config
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb+srv://kbibi:Mrgamer1017$@cluster0-pkbkj.mongodb.net/Cluster0?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true})
var conn = mongoose.createConnection('mongodb+srv://kbibi:Mrgamer1017$@cluster0-pkbkj.mongodb.net/Cluster0?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true});

// Passport Config
require('./config/passport')(passport);

//App Config
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.set("view engine", "ejs");
app.use(methodOverride("_method"))
app.locals.moment = require("moment");

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// --------------------------
// ********* Routes *********
// --------------------------

// --------------------------
// 		 Pages Routes
// --------------------------

// users routes
// For Logging in and Registering Routes
app.use('/users', require('./routes/users.js'));

// Landing Page - GET
app.get('/', (req, res) => {
	// Renders The Landing Page
	res.render('beta')
});

// Home Page - GET *
app.get("/home", ensureAuthenticated, (req, res) => {
	//Find All Posts in database
    Post.find({}, function(err, posts){
		//if there is an error
        if(err){
			// print it out
            console.log(err)
			//and send status 500 (server error!)
			res.sendStatus(500)
		// or 
        } else {
			//render the home page and send posts and the current user
           res.render("home", {posts: posts, user: req.user})
        }
    })
});

// Create New Page - GET *
app.get('/new', ensureAuthenticated, (req, res) => {
	// renders the new page
    res.render("new")
})

// Create New Method - POST
app.post('/new', (req, res) => {
	//create new post
	Post.create({
		//post title
		title: req.body.title,
		//post body
		post: req.body.post,
		// the user who posted it
		author: req.user.username,
	}, function(err, posted){
		// if there is an error
		if(err){
			// print it out
			console.log(err)
			// and send status of 500 (server error!)
			res.sendStatus(500)
		} else {
			// or redirect the user to the home page
			res.redirect("/home")
		}
	})
})

// EDIT Post - GET *
app.get("/edit/post/:id", ensureAuthenticated, (req, res) => {
	// Search the database for the post by using it's id
	Post.findById(req.params.id, function(err, found){
		if(err){
			// if there is an error print it out
			console.log(err)
			// and status of 500 (server error!)
			res.sendStatus(500)
		} else {
			// if everything is ok then render the edit page and send the post along 
			res.render('edit', {post: found})
		}
	})})

//UPDATE Post - PUT
app.put("/edit/:id", (req, res) => {
	// search the database for the post to update it
		Post.findOneAndUpdate(req.params.id, {
			// update post title 
			title: req.body.title,
			// update post user
			author: req.user.username,
			//update the post body
			post: req.body.post,
		}, function(err, updated){
		if(err){
			//if there is an error print it out
			console.log(err)
			// and send 500 status (server error!)
		} else {
			// if everything is ok, redirect the user to the home page
			res.redirect("/home")
		}
	})
})
	
//DELETE Posts - GET *
app.get("/delete/:id", ensureAuthenticated, (req, res) => {
	// search for the post in database using id to delete it
	Post.findByIdAndDelete(req.params.id, function(err, destroyed){
		if(err){
			// if there is an error, print it out
			console.log(err)
		} else {
			res.redirect("/home")
		}
	})
})
	 
// Edit Profile - POST
app.post('/edit/profile', (req, res) => {
	//search the database to find the user using id
	User.findById(req.user._id, (err, found) => {
	  name = req.body.name
	  email = req.user.email
	  password = req.body.password
	  bio = req.body.bio
	  number = req.body.number
	  apartment = req.body.apartment
	  username = req.user.username
	  date = req.user.date
	  photo = req.user.photo
	  //save user after updating 
	  found.save()
	  //redirect the user to his profile
		res.redirect("/profile/" + found._id)
	})
})

// Edit profile Page - GET *
app.get("/edit/profile", ensureAuthenticated, (req, res) => {
	// renders the Profile Editing page
	res.render("profileEdit", {profile: req.user})
})

// Profiles Page *
app.get('/profiles', ensureAuthenticated, (req, res) => {
	//find all users 
	User.find({}, function(err, profiles){
		if(err){
			//if there is an error, print it out
			console.log(err)
		} else {
			// and if not, render the profiles page and send current user data along it
			res.render("profiles", {profiles: profiles, user: req.user})
		}
	})
})
	
// Get Profile By Id
app.get('/profile/:id', (req, res) => {
	// Search for the user using id
	User.findById(req.params.id, function(err, found){
		if(err){
			// if there is an error, print it out
			console.log(err)
		} else {
			//then render the profiles page and send current user along
			res.render("profile", { profile: found, user: req.user})
		} 
	}) 
})

// ----------------
//  Password Routes
// ----------------

// Password encrypter - GET
app.get("/pass", (req, res) => {
	// encrypt password
	bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err; // if there is an error then throw it
            req.body.password = hash // and if everything is fine, save it to hash
				.then(user => {
					// then send a success message to the user
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
					res.send(hash)
			})
			// if there is any error print it out
              .catch(err => console.log(err));
          });
        });
})

//------------------------
// Photos And Files Routes
//------------------------

// Upload Photos - POST *
app.post('/upload', ensureAuthenticated, upload.single('file'), (req, res) => {
	// Find User using id
	User.findById(req.user, (err, found) => {
		if(err){
			// if there is an error, print it out
			console.log(err)
		} else {
			//change user to photo to the new photo
			found.photo = req.file.filename
			// then save it
			found.save()
			// and redirect the user to his profile
			res.redirect('/profile/' + req.user._id)
		}
	})
});

//all file
app.get('/files', (req, res) => {
	//find file using user id
  gfs.files.find(req.user._id, (err, files) => {
    // if Files exist
	// print it out
	console.log(files)
  }
)});

// Get File - GET
app.get('/files/:filename', (req, res) => {
	// Find One File using the user id
  gfs.files.findOne({ _id: req.user._id }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
		// if there is no file
		//send status of 404 (not found)
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // if File exists
	// then send the file
    return res.json(file);
  });
});

// Get Image - GET
app.get('/image/:filename', (req, res) => {
	// find one file using the file name
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
		//if there is no file
		//send 404 (not found)
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if it is an image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
		readstream.pipe(res)
    } else {
		// if it is not an image
		// send 404 (not found)
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// Delete File 
app.delete('/files/:id', (req, res) => {
  // remove file from storage
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
		// if there is an error
		//send 404 (not found)
      return res.status(404).json({ err: err });
    }
	// redirect user to photo
    res.redirect('/photo');
  });
});

// --------------------------
// **** Profile Picture ****
// --------------------------

// Init gfs
let gfs;

//Open Stream
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: 'mongodb+srv://kbibi:Mrgamer1017$@cluster0-pkbkj.mongodb.net/Cluster0?retryWrites=true&w=majority',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
		//renaming files
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

//Get Photo Uploading Page - GET
app.get("/photo", (req, res) => {
	res.render("photo")
})

// Handles any undefined Routes
app.get("*", (req, res) => {
	res.render("error.ejs")
})


// --------------------------
// ****** Start Server ******
// --------------------------

// Listen for server
app.listen(process.env.PORT || 3000, function(){
    console.log('server started')
})
