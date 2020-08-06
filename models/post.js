var mongoose = require("mongoose");

var schema = new mongoose.Schema({
    title: String,
    post: String,
	author: String,
});

module.exports = mongoose.model("Post", schema);
