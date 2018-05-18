var express = require("express");
var passport = require("passport");
var User = require("./models/user");
var Article = require("./models/article");
var Twilio = require("twilio");
var AccessToken = require("twilio").jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

var nodemailer = require("nodemailer");

var router = express.Router();

var usersRouter = require("./routes/users.js");
var videoRouter = require("./routes/video.js");
var articleRouter = require("./routes/article.js");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cs160.final.notification@gmail.com",
    pass: "cs160gobears"
  }
});

router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

router.use("/users", usersRouter);
router.use("/video", videoRouter);
router.use("/articles", articleRouter);

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

router.get("/", function(req, res, next) {
  Article.find()
    .sort({ createdAt: "descending" })
    .exec(function(err, articles) {
      if (err) {
        console.log(err);
        return next(err);
      }
      res.render("index", { articles: articles });
    });
});

router.get("/explore", ensureAuthenticated, function(req, res, next) {
  Article.find()
    .sort({ createdAt: "descending" })
    .exec(function(err, articles) {
      if (err) {
        console.log(err);
        return next(err);
      }
      res.render("explore", { articles: articles });
    });
});

router.get("/signup", function(req, res) {
  res.render("signup");
});

router.post(
  "/signup",
  function(req, res, next) {
    var username = req.body.username;
    var displayName = req.body.displayName;
    var password = req.body.password;
    var politicalLeaning = req.body.politicalLeaning;

    User.findOne({ username: username }, function(err, user) {
      if (err) {
        return next(err);
      }
      if (user) {
        req.flash("error", "User already exists");
        return res.redirect("/signup");
      }

      var newUser = new User({
        username: username,
        displayName: displayName,
        password: password,
        politicalLeaning: politicalLeaning
      });
      newUser.save(next);
    });
  },
  passport.authenticate("login", {
    successRedirect: "/explore",
    failureRedirect: "/signup",
    failureFlash: true
  })
);

router.get("/login", function(req, res) {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/explore",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.get("/edit", ensureAuthenticated, function(req, res) {
  res.render("edit");
});

router.post("/edit", ensureAuthenticated, function(req, res, next) {
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  if (
    req.body.politicalLeaning != "left" &&
    req.body.politicalLeaning != "right"
  ) {
    req.flash("error", "Political leaning must be 'left' or 'right'");
    return res.redirect("/edit");
  }
  req.user.politicalLeaning = req.body.politicalLeaning;
  req.user.save(function(err) {
    if (err) {
      next(err);
      return;
    }
    req.flash("info", "Profile updated!");
    res.redirect("/edit");
  });
});

router.get("/topic1", function(req, res) {
  res.render("topic1");
});

router.get("/topic/:name", function(req, res) {
  var name = req.params.name;
  Article.findOne({ path: name }, function(err, article) {
    res.render("topic", { article: article });
  });
});

router.get("/join/:articleName", ensureAuthenticated, function(req, res) {
  var article = req.params.articleName;
  var user = req.user;
  var currUserName = req.user.displayName;
  Article.findOne({ path: article }, function(err, article) {
    var politicalLeaning = user.politicalLeaning;
    if (politicalLeaning === "left") {
      if (!article)
        res.render("match", { otherUser: user, currentArticle: article });
      else {
        if (article.rightQueue.length == 0) {
          if (article.leftQueue.indexOf(user._id) > -1) {
            req.flash("info", "You are already on the queue");
            res.redirect("back");
          } else {
            article.leftQueue.push(user._id);
            Article.update(
              { _id: article._id },
              { leftQueue: article.leftQueue },
              { upsert: true },
              function(err) {
                req.flash("info", "You are added on the queue");
                res.redirect("back");
                console.log(err);
              }
            );
          }
        } else {
          var matchedUser = article.rightQueue.shift();
          Article.update(
            { _id: article._id },
            { rightQueue: article.rightQueue },
            { upsert: true },
            function(err) {
              User.findOne({ _id: matchedUser }, function(error, user) {
                var roomName = "" + Math.round(Math.random() * 10000);
                var videoUrl =
                  "https://" + req.get("host") + "/video/rooms/" + roomName;

                var mail = {
                  from: "cs160.final.notification@gmail.com", // sender address
                  to: user.username, // list of receivers
                  subject: "You Have Been Matched on Insight!", // Subject line
                  html:
                    "<p>You have been matched with" +
                    currUserName +
                    " </p>" +
                    "<br/>" +
                    '<a href="' +
                    videoUrl +
                    '"> Click here to talk to the person </a>' // plain text body
                };

                transporter.sendMail(mail, function(err, info) {
                  if (err) console.log(err);
                  else console.log(info);
                });
                res.render("match", {
                  otherUser: user,
                  url: videoUrl,
                  currentArticle: article
                });
              });
            }
          );
        }
      }
    } else {
      if (!article)
        res.render("match", { otherUser: user, currentArticle: article });
      else {
        if (article.leftQueue.length == 0) {
          if (article.rightQueue.indexOf(user._id) > -1) {
            req.flash("info", "You are already on the queue");
            res.redirect("back");
          } else {
            article.rightQueue.push(user._id);
            Article.update(
              { _id: article._id },
              { rightQueue: article.rightQueue },
              { upsert: true },
              function(err) {
                req.flash("info", "You are added on the queue");
                res.redirect("back");
              }
            );
          }
        } else {
          var matchedUser = article.leftQueue.shift();
          Article.update(
            { _id: article._id },
            { leftQueue: article.leftQueue },
            { upsert: true },
            function(err) {
              User.findOne({ _id: matchedUser }, function(error, user) {
                var roomName = "" + Math.round(Math.random() * 10000);
                var videoUrl =
                  "https://" + req.get("host") + "/video/rooms/" + roomName;

                var mail = {
                  from: "cs160.final.notification@gmail.com", // sender address
                  to: user.username, // list of receivers
                  subject: "You Have Been Matched on Insight!", // Subject line
                  html:
                    "<p>You have been matched with" +
                    currUserName +
                    " </p>" +
                    "<br/>" +
                    '<a href="' +
                    videoUrl +
                    '"> Click here to talk to the person </a>' // plain text body
                };

                transporter.sendMail(mail, function(err, info) {
                  if (err) console.log(err);
                  else console.log(info);
                });

                res.render("match", {
                  otherUser: user,
                  url: videoUrl,
                  currentArticle: article
                });
                // res.redirect("/")
              });
            }
          );
        }
      }
    }
  });
});

router.get("/rating", function(req, res) {
  res.render("rating");
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/login");
  }
}

module.exports = router;
