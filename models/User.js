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
	required: false,
},
 number: {
	type: Number,
	required: false,
},
  apartment: {
	  type: String,
	  required: true,
  },
	photo: {
		type: String,
		required: false
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
