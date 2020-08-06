var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.set("view engine", "ejs");
var Post = require("./models/post.js")
mongoose.connect('mongodb+srv://kbibi:Mrgamer1017$@cluster0-pkbkj.mongodb.net/Cluster0?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true});

app.get("/", function(req, res){
	res.render("beta")
})

app.get("/home", function(req, res){
    Post.find({}, function(err, posts){
        if(err){
            console.log(err)
        } else {
           res.render("home", {posts: posts})
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

app.listen(procces.env.PORT || 80, function(){
    console.log('server started')
})
