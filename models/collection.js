var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var collectionSchema = new Schema({
  description: String,
  image: String,
  isERC721: Boolean,
  metadataUrl: String,
  name: String,
  owner: String,
  platform: String,
  token: String,
  network: Number
}, { collection: 'Collections' });

module.exports = mongoose.model('Collection', collectionSchema);
