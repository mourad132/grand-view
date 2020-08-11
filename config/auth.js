module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/home');      
  },
	isDev: function(req, res, next){
		if(req.user._id == "5f32a85f49d2e017c66b3608"){
			return next()
		} else {
			res.redirect("/home")
		}
	}	
	};
