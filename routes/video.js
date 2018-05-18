var express = require("express");
var router = express.Router();
var Util = require("./utils");
var Twilio = require("twilio");
var AccessToken = require("twilio").jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

router.get("/rooms/:roomNumber", Util.ensureAuthenticated, function(req, res) {
  var topic = req.query.topic;
  var roomNumber = req.params.roomNumber;
  console.log(topic);
  res.render("video", { roomNumber: roomNumber, topic: topic });
});

router.get("/token", function(request, response) {
  var user = request.user;

  var identity = request.user.name();

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created.
  var token = new AccessToken(
    "AC44747a07c4a03e1602c28191d8e335d6",
    "SK75d262c8870e9cf046d2ebf05a22e5bf",
    "r2W3FG0SzwnW84SMxEQBfXrXLbMTCsGt"
  );

  // Assign the generated identity to the token.
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  var grant = new VideoGrant();
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response.
  response.send({
    identity: identity,
    token: token.toJwt()
  });
});

module.exports = router;
