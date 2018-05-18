var mongoose = require("mongoose");

var matchSchema = mongoose.Schema({
  firstPersonId: { type: String, required: true },
  secondPersonId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  articleId: { type: String, required: true }
});

var Match = mongoose.model("Match", matchSchema);

module.exports = Match;
