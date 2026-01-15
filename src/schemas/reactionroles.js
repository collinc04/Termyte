const {Schema, model} = require('mongoose');

//role assignment info
let role_assignment = new Schema({
    Guild: String,
    Message: String,
    Emoji: String,
    Role: String,
    Label: String
});

module.exports = model('role_assignment', role_assignment);