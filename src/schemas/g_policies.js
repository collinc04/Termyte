const {Schema, model} = require('mongoose');

//store guild's enforcement policies for automod
let g_policies = new Schema({
    Guild: String,
    Enforcement: {type: Boolean, default: false},
    EnforcementMagnitude: {type: Number, default: 10},
    CmdsCooldown: {type: Number, default: 2}
});

module.exports = model('g_policies', g_policies);