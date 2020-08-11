const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
	type: String,
	required: true,
},
  apartment: {
	  type: Number,
	  required: true,
  },
	username: {
		type: String,
		required: true,
	},
  date: {
    type: Date,
    default: Date.now
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
