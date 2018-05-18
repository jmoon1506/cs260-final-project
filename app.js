var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var flash = require("connect-flash");
var passport = require("passport");

var setUpPassport = require("./setuppassport");
var routes = require("./routes");

var app = express();

mongoose.connect(
  "mongodb://heroku-deploy:password@ds063856.mlab.com:63856/cs160-final-db",
  function() {
    console.log("Mongo Server Connected");
  }
);

/* This middleware is to force the users to go to our https connection
*  because we need that in oder to access their webrtc camera and audio
*/
app.get("*", function(req, res, next) {
  console.log("headers: ", req.headers["host"] != "localhost:3000");
  if (
    req.headers["x-forwarded-proto"] != "https" &&
    req.headers["host"] != "localhost:3000"
  ) {
    res.redirect("https://cs-160-final.herokuapp.com" + req.url);
  } else {
    next(); /* Continue to other routes if we're not redirecting */
  }
});
/* Put query in the ejs access
*/
app.use(function(req, res, next) {
  res.locals.url = req.originalUrl;
  next();
});

setUpPassport();

app.set("port", process.env.PORT || 3000);
app.use("/static", express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(routes);

app.listen(app.get("port"), function() {
  console.log("Server started on port " + app.get("port"));
});
