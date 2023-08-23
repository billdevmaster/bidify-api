var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser');
var axios = require("axios");
var Moralis = require('moralis').default;
// var itemRouter = require('./routers/item');
var auctionRouter = require('./routers/auction');
require('dotenv').config();
const Web3 = require("web3");
const { URLS, BIDIFY, Apis, getLogUrl } = require("./utils/config");
const Auction = require("./models/auction");
const { getNftDetail } = require('./utils/nft');

var app = express();

var HOST_NAME = process.env.DB_URL;
// var DATABASE_NAME = 'Bidify';

mongoose.connect(HOST_NAME).catch(error => console.error("error", error.message));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

app.use('/api', auctionRouter);

Moralis.start({
  apiKey: process.env.MORALIS_API_KEY,
  // ...and any other configuration
});

app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + process.env.PORT);
});

const checkAuctions = async () => {
  while (process.env.LOOP == "true") {
    for (const property in URLS) {
      const chainId = property;
      
      const rpcUrl = URLS[property];
      if (!rpcUrl) {
        continue;
      }
      const web3 = new Web3(new Web3.providers.HttpProvider(URLS[chainId]));
      
      const Bidify = new web3.eth.Contract(BIDIFY.abi, BIDIFY.address[chainId]);
      const topic0 =
        "0x5424fbee1c8f403254bd729bf71af07aa944120992dfa4f67cd0e7846ef7b8de";
      let logs = [];
      try {
        if (chainId == 9001) {
          continue;
        }
        if (chainId == 43114 || chainId == 137 || chainId == 5 || chainId == 56 || chainId == 1285) {
          const ret = await axios.get(`${getLogUrl[chainId]}&fromBlock=0&${chainId === 9001 || chainId === 100 || chainId === 61 ? 'toBlock=latest&' : ''}address=${BIDIFY.address[chainId]}&topic0=${topic0}&apikey=${Apis[chainId]}`)
          logs = ret.data.result
        } else {
          logs = await web3.eth.getPastLogs({
            fromBlock: "earliest",
            toBlock: "latest",
            address: BIDIFY.address[chainId],
            topics: [topic0],
          });
        }
        
        const totalAuctionCount = await Auction.count({ network: chainId });
        const pendingAuctionIdList = [];
        if (totalAuctionCount == logs.length) {
          // getting the last ones.
          const pendingAuctions = await Auction.find({ network: chainId, paidOut: false });
          for (let i = 0; i < pendingAuctions.length; i++) {
            pendingAuctionIdList.push(pendingAuctions[i].id);
          }
        }
        for (let i = 0; i < logs.length; i++) {
          if (totalAuctionCount == logs.length) {
            if (!pendingAuctionIdList.includes(i.toString())) {
              continue;
            }
          }
          const list = await Bidify.methods.getListing(i).call();
          // save new record.
          const data = { network: chainId, id: i.toString() };
          data.creator = list[0];
          data.currency = list[1];
          data.platform = list[2];
          data.token = list[3];
          data.price = list[4];
          data.endingPrice = list[5];
          data.referrer = list[6];
          data.highBidder = list[8];
          data.endTime = list[9];
          data.paidOut = list[10];
          data.isERC721 = list[11];
          
          if (totalAuctionCount != logs.length) {
            const metadata = await getNftDetail(data.platform, data.token, chainId, data.isERC721)
            data.name = metadata.name;
            data.image = metadata.image;
            data.description = metadata.description;
            data.metadataUrl = metadata.metadataUrl;
            const databaselist = await Auction.findOne({ network: chainId, id: i });
            if (!databaselist) {
              const newData = new Auction(data);
              await newData.save();
              console.log("new data save", chainId, i)
            }
          }
          // check highbidder and paidout
          if (pendingAuctionIdList.includes(i.toString())) {
            const auction = await Auction.findOne({ network: data.network, id: data.id });
            if (auction.paidOut != data.paidOut || auction.highBidder != data.highBidder || auction.referrer != data.referrer || auction.price != data.price) {
              auction.paidOut = data.paidOut;
              auction.highBidder = data.highBidder;
              await auction.save();
              console.log("update save", chainId, i)
            }
          }

        }

      } catch (e) {
        console.log(`error: ${chainId}: `, e.message)
      }
  
      
      }
    }
}

checkAuctions();