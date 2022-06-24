const express = require('express')
const router = express.Router()

const Item = require('../models/Item')
const verifyToken = require('../verifyToken')
const {itemAuctionValidation, itemBidValidation} = require('../validations/validation')

// view all items
router.get('/', verifyToken, async(req,res) => {
	try {
		const items = await Item.find()
		res.send(items)
	} catch(err) {
		res.status(400).send({message:err})
	}
})

// list items sold by a user
router.get('/sold', verifyToken, async(req,res) => {
	try {
		const items = await Item.find({"seller": {"$eq": req.body.username}, "expiration_time": {"$lt": new Date()}})

		res.send(items)
	} catch(err) {
		res.status(400).send({message:err})
	}
})

// list items sold by a user
router.get('/all-sold', verifyToken, async(req,res) => {
	try {
		// checks if the expiration date is less than the current date and
		// check if the highest_bidder array has a second item (the first is the seller)
		const items = await Item.find({"expiration_time": {"$lt": new Date()}, "highest_bidder.1": {"$exists": true}})

		res.send(items)
	} catch(err) {
		res.status(400).send({message:err})
	}
})

// list failed auctions, expired auctions which had no bidders
router.get('/all-failed', verifyToken, async(req,res) => {
	try {
		const items = await Item.find({"expiration_time": {"$lt": new Date()}, "highest_bidder.1": {"$exists": false}})

		res.send(items)
	} catch(err) {
		res.status(400).send({message:err})
	}
})

// list items up for auction
router.get('/auctioning', verifyToken, async(req,res) => {
	try {
		const items = await Item.find({"expiration_time": {"$gt": new Date()}})

		res.send(items)
	} catch(err) {
		res.status(400).send({message:err})
	}
})

// auction an item
router.post('/auction', verifyToken, async(req,res) => {
	const {error} = itemAuctionValidation(req.body)
	if (error) {
		return res.status(400).send({message:error['details'][0]['message']})
	}
	const itemExists = await Item.findOne({title:req.body.title})
	if (itemExists) {
		return res.status(400).send({message:"already registered this item"})
	}
	const newItem = new Item({
		title:req.body.title,
		timestamp:req.body.timestamp,
		condition:req.body.conditoin,
		description:req.body.description,
		expiration_time:req.body.expiration_time,
		// the seller puts their own name down as the first bidder
		// this allows them to set a minimum price they are willing to sell their item for
		// if the item has no real bidders, the seller is considdered the "winner"
		highest_bidder:req.body.highest_bidder,
		highest_bid_gbp:req.body.highest_bid_gbp,
		seller:req.body.seller
	})
	try {
		const savedItem = await newItem.save()
		res.send(savedItem)
	} catch (err) {
		res.status(400).send({message:err})
	}
})

// get an item
router.get('/:id', verifyToken, async(req,res) => {
	res.send(await Item.find({"_id": {"$eq": req.params.id}}))
})

// get an item's bidding history
router.get('/:id/history', verifyToken, async(req,res) => {
	res.send(await Item.find({"_id": {"$eq": req.params.id}}, {"highest_bidder": 1, "highest_bid_gbp": 1}))
})

// bid for an item
router.patch('/:id', verifyToken, async(req,res) => {
	const {error} = itemBidValidation(req.body)
	if (error) {
		return res.status(400).send({message:error['details'][0]['message']})
	}
	itemToBid = Item.findById(req.params.id)
	
	
	try {
		const items = await Item.find({"_id": {"$eq": req.params.id}}, {highest_bid_gbp: 1, seller: 1, expiration_time: 1})
		const currentHighestBid = items[0]["highest_bid_gbp"][items[0]["highest_bid_gbp"].length-1]
		if (new Date() > items[0]["expiration_time"]) {
			res.send("This auction has expired")
		} else if (items[0]["seller"] == req.body.highest_bidder) { 
			res.send("Sorry " + req.body.highest_bidder + ", you cannot bid for the item you are selling.")
		} else if (currentHighestBid >= req.body.highest_bid_gbp) { 
			res.send("Your bid is too low! It must be greater than the current highest bid: " 
				+ currentHighestBid)
		} else {
			const result = await Item.findByIdAndUpdate(req.params.id, { $push: {highest_bidder: req.body.highest_bidder, highest_bid_gbp: req.body.highest_bid_gbp} }, {new: true})
			res.send(result)
		}
	} catch (error) {
		console.log(error.message)
	}
})

module.exports = router
