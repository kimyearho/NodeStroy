var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var testSchema = new Schema({
   title : String ,
   contents : String
});

module.exports = mongoose.model('blogs', testSchema);