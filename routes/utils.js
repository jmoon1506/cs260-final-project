function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    req.session.returnTo = req.path;
    res.redirect("/login");
  }
}

exports.ensureAuthenticated = ensureAuthenticated;
