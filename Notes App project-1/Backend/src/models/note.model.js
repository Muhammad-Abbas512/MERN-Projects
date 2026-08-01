const mongoose = require('mongoose');


const noteSchema = new mongoose.Schema({

    title: String,
    description: String

})

const noteModel = mongoose.model("Note", noteSchema);


module.exports = noteModel;

/*

CRUD Operations

create - POST
read - GET
update - PATCH
delete - DELETE

*/