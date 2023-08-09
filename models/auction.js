var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var auctionSchema = new Schema({
  id: {
    type: String,
    unique: false,
    required: true
  },
  allowMarketplace: Boolean,
  bids: [{
    bidder: String,
    price: String,
  }],
  creator: String,
  currency: String,
  currentBid: String,
  endingPrice: String,
  description: String,
  endTime: String,
  highBidder: String,
  image: String,
  image_cache: String,
  marketplace: String,
  metadataUrl: String,
  name: String,
  nextBid: String,
  owner: String,
  paidOut: Boolean,
  platform: String,
  referrer: String,
  token: String,
  isERC721: Boolean,
  network: Number
}, { collection: 'Auctions' });

module.exports = mongoose.model('Auction', auctionSchema);
