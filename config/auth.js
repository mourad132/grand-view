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
          if(req.user._id == "5f2ed45a2625c21c561e3a21"){
              return next()
          } else {
              res.redirect("/home")
          }
      }	
      };
  