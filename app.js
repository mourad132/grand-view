var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
var app = express();
var { ensureAuthenticated } = require("./config/auth.js")
var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var passportLocalMongoose = require("passport-local-mongoose");
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.set("view engine", "ejs");
var Post = require("./models/post.js")
var methodOverride = require("method-override")
var User = require('./models/User.js')
mongoose.connect('mongodb+srv://kbibi:Mrgamer1017$@cluster0-pkbkj.mongodb.net/Cluster0?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true})
var conn = mongoose.createConnection('mongodb+srv://kbibi:Mrgamer1017$@cluster0-pkbkj.mongodb.net/Cluster0?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true});
app.use(methodOverride("_method"))
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
 
// Passport Config
require('./config/passport')(passport);

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

// Routes
app.use('/users', require('./routes/users.js'));


app.get('/', (req, res) => {
	res.render('beta')
})
app.get("/home", ensureAuthenticated, function(req, res){
    Post.find({}, function(err, posts){
        if(err){
            console.log(err)
        } else {
           res.render("home", {posts: posts, user: req.user})
        }
    })
});

app.get('/new', ensureAuthenticated, function(req, res){
    res.render("new")
})

app.post('/new', function(req, res){
	Post.create({
		title: req.body.title,
		post: req.body.post,
		author: req.user.username,
	}, function(err, posted){
		if(err){
			console.log(err)
		} else {
			res.redirect("/home")
		}
	})
})

//EDIT
app.get("/edit/post/:id", ensureAuthenticated, function(req, res){
	Post.findById(req.params.id, function(err, found){
		if(err){
			console.log(err)
		} else {
			res.render('edit', {post: found})
		}
	})})

//UPDATE
app.put("/edit/:id", function(req, res){
		Post.findOneAndUpdate(req.params.id, {
			title: req.body.title,
			author: req.user.username,
			post: req.body.post,
		}, function(err, updated){
		if(err){
			console.log(err)
		} else {
			res.redirect("/home")
		}
	})
})
	
//DELETE
app.get("/delete/:id", ensureAuthenticated,function(req, res){
	Post.findByIdAndDelete(req.params.id, function(err, destroyed){
		if(err){
			console.log(err)
		} else {
			res.redirect("/home")
		}
	})
})

//READ
app.get("/show/:id", (req, res) => {
	Post.findById(req.params.id, (err, found) => {
		if(err){
			console.log(err)
		} else {
			res.render({post: found})
		}
	})
})

app.put('/edit/profile', (req, res) => {
	User.findOneAndUpdate({_id: req.user._id}, {
	  name: req.body.name,
	  email: req.user.email,
	  password: req.body.password,
	  bio: req.body.bio,
	  number: req.body.number,
	  apartment: req.body.apartment,
	  photo: req.user.photo,
	  username: req.user.username,
	  date: req.user.date,
	}, (err, updated) => {
		if(err){
			console.log(err)
		} else {
			res.redirect("/profile/" + req.user._id)
		}
	})
})

app.get("/edit/profile", ensureAuthenticated, (req, res) => {
	res.render("profileEdit", {profile: req.user})
})


app.get('/profiles', ensureAuthenticated, function(req, res){
	User.find({}, function(err, profiles){
		if(err){
			console.log(err)
		} else {
			res.render("profiles", {profiles: profiles, user: req.user})
		}
	})
})
	
app.get('/profile/:id', (req, res) => {
	User.findById(req.params.id, function(err, found){
		if(err){
			console.log(err)
		} else {
			res.render("profile", { profile: found, user: req.user})
		} }) })

//PROFILE PHOTO

// Init gfs
let gfs;

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

// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
	res.render("copy.ejs", {name: req.file.filename})
});

app.post('/edit', upload.single('file'), (req, res) => {
	res.render("editPic.ejs", {name: req.file.filename, user: req.user})
});

// @route GET /files
// @desc  Display all files in JSON
app.get('/files', (req, res) => {
  gfs.files.find(req.user._id, (err, files) => {
    // Files exist
	console.log(files)
  }
)});

// @route GET /files/:filename
// @desc  Display single file object
app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ _id: req.user._id }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});

// @route GET /image/:filename
// @desc Display Image
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
		readstream.pipe(res)
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

app.get("/storage", (req, res) => {
	storage.find({}, (err, found) => {
		if(err){
			console.log(err)
		} else {
			res.json(found)
		}
	})
})

app.get("/facebook/auth", (req, res) => {
	console.log(req)
})

// @route DELETE /files/:id
// @desc  Delete file
app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/photo');
  });
});

app.get("/profilephoto", (req, res) => {
	res.render("profilephoto")
})

app.get("/photo", function(req, res){
	res.render("photo")
})

app.get('/kd', (req, res) => {
	User.findByIdAndDelete({_id: "5f39a90b032afb0017d3505a"}, (err, deleted) => {
		if(err){
			console.log(err)
		} else {
			console.log("deleted")
		}
	})
})

app.get("*", (req, res) => {
	res.render("error.ejs")
})


app.listen(process.env.PORT || 3000, function(){
    console.log('server started')
})
