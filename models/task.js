var mongoose = require("mongoose");

var taskSchema = mongoose.Schema({
    name : { type : String, required : true },
    createdAt : { type : Date, default : Date.now() }
});

var Task = mongoose.model("Task", taskSchema);

module.exports = Task;
