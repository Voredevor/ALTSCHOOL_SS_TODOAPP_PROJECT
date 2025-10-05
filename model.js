const mongoose = require("mongoose");
const { Schema } = mongoose;

// User Schema settings 
const userSchema =  new Schema({ 
    username: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true},
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now}
}); 

// Schema for Tasks 
const TaskSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, maxlength: 200},
    description: { type: String },
    status: { type: String, enum: [ "Pending", "Completed", "Deleted"], default: "Pending", index: true },
    priority: { type: String, enum: [ "low", "medium", "high" ], default: "medium" },
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

TaskSchema.pre( "save", function(next) {
    this.updatedAt = Date.now(); 
    next(); 
}); 

const User = mongoose.model( "User", userSchema );
const Task = mongoose.model( "Task", TaskSchema );


module.exports = { User, Task };


