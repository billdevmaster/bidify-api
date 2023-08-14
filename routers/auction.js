var express = require('express');
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
var Auction = require('../models/auction');
var Collection = require('../models/collection');
const { default: axios } = require('axios');

var auctionRouter = express.Router();
auctionRouter
    .route('/admin')
    .post(function (request, response) {

        Auction.insertMany(request.body).then(function () {
            console.log("Data inserted")  // Success
            response.status(201).send("success")
        }).catch(function (error) {
            console.log(error)      // Failure
            response.status(500).send(error);
        });

        // response.status(201).send(auction);
    })
auctionRouter
    .route('/auctions')
    .post(async (request, response) => {

        console.log('POST /auctions');

        var auction = new Auction(request.body);

        await auction.save();
        await Collection.deleteOne({ token: request.body.token, network: request.body.network, platform: {'$regex': `^${request.body.platform}$`, $options: 'i'}})
        console.info("saved auction and deleted collection")
        response.status(201).send(auction);
    })
    .get(function (request, response) {

        console.log('GET /auctions');

        Auction.find({ network: request.query.chainId, paidOut: false }, function (error, auctions) {

            if (error) {
                response.status(500).send(error);
                return;
            }

            // console.log(auctions);

            response.json(auctions);
        });
    });

auctionRouter
    .route('/auctions/:auctionId')
    .get(function (request, response) {

        console.log('GET /auctions/:auctionId');

        var auctionId = request.params.auctionId;
        var chainId = request.query.network
        console.log(chainId)
        Auction.findOne({ id: auctionId, network: chainId }, function (error, auction) {

            if (error) {
                response.status(500).send(error);
                return;
            }

            // console.log(auction);

            response.json(auction);

        });
    })
    .put(function (request, response) {

        var auctionId = request.params.auctionId;

        console.log('PUT /auctions/:auctionId', auctionId);

        let update = new Auction(request.body)
        // return console.log(Object.keys(request.body))\
        // const isFinished = request.body.paidOut
        // return console.log(isFinished)
        Auction.findOneAndUpdate({ id: auctionId, network: request.body.network }, request.body, async (error, auction) => {

            if (error) {
                console.error(error.message)
                response.status(500).send(error);
                return;
            }

            if (auction) {
                console.log("success!!!!!!", request.body)
                const collection = new Collection(request.body)
                await collection.save()
                response.json(update);
                return;
            }

            response.status(404).json({
                message: 'Auction with id ' + auctionId + ' was not found.'
            });
        });
    })
    .delete(function (request, response) {

        console.log('DELETE /auctions/:auctionId');

        var auctionId = request.params.auctionId;

        Auction.findOne({ id: auctionId }, function (error, auction) {

            if (error) {
                response.status(500).send(error);
                return;
            }

            if (auction) {
                auction.remove(function (error) {

                    if (error) {
                        response.status(500).send(error);
                        return;
                    }

                    response.status(200).json({
                        'message': 'Auction with id ' + auctionId + ' was removed.'
                    });
                });
            } else {
                response.status(404).json({
                    message: 'Auction with id ' + auctionId + ' was not found.'
                });
            }
        });
    });

auctionRouter
    .route('/admincollection')
    .delete(function (request, response) {
        console.log(request.body)
    })
    .post(function (request, response) {

        Collection.insertMany(request.body).then(function () {
            console.log("Data inserted")  // Success
            response.status(201).send("success")
        }).catch(function (error) {
            console.log(error)      // Failure
            response.status(500).send(error);
        });

        // response.status(201).send(auction);
    })
    .put(async function (request, response) {
        await Collection.deleteMany({ network: request.body.chainId, owner: request.body.owner })
        Collection.insertMany(request.body.data).then(function () {
            console.log("data inserted")
            response.status(201).send("success")
        }).catch(function (error) {
            console.log(error)
            response.status(500).send(error)
        })
    })
auctionRouter
    .route('/collection')
    .post(function (request, response) {

        console.log('POST /collections');

        var auction = new Auction(request.body);

        auction.save();

        response.status(201).send(auction);
    })
    .get(function (request, response) {

        const { chainId, owner } = request.query

        console.log('GET /collections', owner);

        Collection.find({ network: chainId, owner: owner }, function (error, nfts) {

            if (error) {
                response.status(500).send(error);
                return;
            }

            // console.log(auctions);

            response.json(nfts);
        });
    });
auctionRouter
    .route('/collection/:platform/:id')
    .get(function (request, response) {
        const { platform, id } = request.params
        const { chainId, owner } = request.query

        console.log('GET /collection/:platform/:id', platform, id, chainId, owner);

        Collection.find({ network: chainId, owner: owner, platform: {'$regex': `^${platform}$`, $options: 'i'}, token: id }, function (error, nfts) {

            if (error) {
                response.status(500).send(error);
                return;
            }

            // console.log(auctions);

            response.json(nfts[0]);
        });
    })

auctionRouter
    .route('/fetchWalletNfts')
    .get(async function (req, res) {
        const { chainId, address, cursor } = req.query;
        console.log(address);
        const nfts = [];
        
        let chain = {};
        if (chainId == 137) {
            chain = EvmChain.POLYGON;
        } else if (chainId == 56) {
            chain = EvmChain.BSC;
        } else if (chainId == 43114) {
            chain = EvmChain.AVALANCHE;
        } else if (chainId == 42161) {
            chain = EvmChain.ARBITRUM;
        }
        
        let response = await Moralis.EvmApi.nft.getWalletNFTs({
            address,
            chain,
            cursor
        });
        for (let i = 0; i < response.jsonResponse.result.length; i++) {
            // if (response.jsonResponse.result[i].possible_spam == false) {
            const data = response.jsonResponse.result[i];
            let { name, image, description } = "";
            if (!data.metadata) {
                try {
                    const metadata = await axios.get(data.token_uri);
                    // get metadata from token_uri
                    name = metadata.data.name;
                    image = metadata.data.image;
                    description = metadata.data.description;
                } catch (e) {
                    continue;
                }
            } else {
                const metadata = JSON.parse(data.metadata);
                name = metadata.name;
                image = metadata.image;
                description = metadata.description;
            }
            console.log(data.metadata);
            console.log(image, data.token_uri);
            if (!image) {
                continue;
            }
            if (image && image.includes('ipfs://')) image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
            nfts.push({
                name,
                description,
                image,
                platform: data.token_address,
                token: data.token_id,
                amount: data.amount,
                token_uri: data.token_uri,
                isERC721: data.contract_type == "ERC721" ? true : false,
            });
            // }
        }
        console.log(nfts.length)

        return res.json({nfts: nfts, cursor: response.jsonResponse.cursor});
    })

module.exports = auctionRouter;