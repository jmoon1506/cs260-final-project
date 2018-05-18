var express = require("express");
var router = express.Router();
var Article = require("../models/article");

router.get("/addarticle", function(req, res) {
  res.render("addArticle", {});
});

router.post("/addarticle", function(req, res) {
  var name = req.body.name;
  var url = req.body.url;

  var article = {
    name: name,
    url: url,
    leftQueue: [],
    rightQueue: []
  };

  Article.create(article, function(err, small) {
    if (err) {
      req.flash("error", "There was an error in processing your data");
      return res.redirect("/edit");
    } else {
      req.flash("info", "Article added!");
      res.redirect("/articles/addarticle");
    }
  });
});

router.get("/adddefaultarticle", function(req, res) {
  var article = {
    name: "Immigration",
    url:
      "https://www.newyorker.com/news/daily-comment/when-a-day-in-court-is-a-trap-for-immigrants",
    leftQueue: [],
    rightQueue: []
  };
  Article.create(article, function(err, small) {
    var article2 = {
      name: "Trump",
      url:
        "https://townhall.com/tipsheet/katiepavlich/2017/11/08/president-trump-attempted-a-surprise-visit-to-the-dmz-n2406573",
      leftQueue: [],
      rightQueue: []
    };
    Article.create(article2, function(err, small) {
      var article3 = {
        name: "Gun Control",
        url:
          "https://townhall.com/columnists/justinhaskins/2017/11/06/we-dont-need-gun-control-to-stop-mass-shootings-n2405286",
        leftQueue: [],
        rightQueue: []
      };
      Article.create(article3, function(err, small) {
        res.send(200);
      });
    });
  });
});

module.exports = router;
