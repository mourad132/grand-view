var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
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
mongoose.connect('mongodb+srv://kbibi:Mrgamer1017$@cluster0-pkbkj.mongodb.net/Cluster0?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true});
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


app.get("/", function(req, res){
	res.render("beta")
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

app.get('/new', function(req, res){
    res.render("new")
})

app.post("/new", function(req, res){
    Post.create({
		title: req.body.title,
        post: req.body.post,
		author: req.body.author,
    }, function(err, posted){
        if(err){
            console.log(err)
        } else {
            res.redirect("/home")
        }
    })
})

//EDIT
app.get("/edit/:id", function(req, res){
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
			author: req.body.author,
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
app.get("/delete/:id", function(req, res){
	Post.findByIdAndDelete(req.params.id, function(err, destroyed){
		if(err){
			console.log(err)
		} else {
			res.redirect("/home")
		}
	})
})

app.listen(proccess.env.PORT || 80, function(){
    console.log('server started')
})
