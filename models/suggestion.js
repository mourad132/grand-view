const mongoose = require("mongoose");
const Schema = mongoose.Schema({
	type: String,
	image: String,
	vote: Boolean,
	body: String,
	author: String,
	comments: [],
})

module.exports = mongoose.model("Suggestion", Schema)
