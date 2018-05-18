var mongoose = require("mongoose");
var bcrypt = require('bcrypt');

var SALT = 10;

var userSchema = mongoose.Schema({
    username : { type : String, required: true, unique : true}, // is actually the EMAIL
    password : { type: String, required : true },
    createdAt  : { type : Date, default : Date.now() },
    displayName : { type: String },
    bio : { type : String},
    politicalLeaning: {type: String, required: true}
})

userSchema.methods.name = function() {
    return this.displayName || this.username;
}

userSchema.pre("save", function(done) {
    var user = this;

    if (!user.isModified("password")) {
        return done();
    }

    bcrypt.genSalt(SALT, function(err, salt) {
        if (err) return done(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return done(err);
            user.password = hash;
            done();
        });
    });

});

userSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
};

var User = mongoose.model("User", userSchema);

module.exports = User;
