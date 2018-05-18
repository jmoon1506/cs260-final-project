var mongoose = require("mongoose");

var articleSchema = mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String },
  createdAt: { type: Date, default: Date.now() },
  url: { type: String, required: true },
  leftQueue: [String],
  rightQueue: [String]
});

articleSchema.pre("save", function(done) {
  var article = this;
  article.path = article.name.replace(/\s/g, "");
  done();
});

var Article = mongoose.model("Articles", articleSchema);

module.exports = Article;
