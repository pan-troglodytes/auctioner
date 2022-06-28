const express = require('express')
const router = express.Router()

const Item = require('../models/Item')
const User = require('../models/User')
const verifyToken = require('../verifyToken')
const {itemAuctionValidation, itemBidValidation} = require('../validations/validation')

// view all items
router.get('/', async(req,res) => {
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
		const items = await Item.find({"bidders.0": {"$eq": req.body.username}, "expiration_time": {"$lt": new Date()}})
		res.send(items)
	} catch(err) {
		res.status(400).send({message:err})
	}
})

// list items sold by users
router.get('/all-sold', verifyToken, async(req,res) => {
	try {
		// checks if the expiration date is less than the current date and
		// check if the bidders array has a second item (the first is the seller)
		const items = await Item.find({"expiration_time": {"$lt": new Date()}, "bidders.1": {"$exists": true}})

		res.send(items)
	} catch(err) {
		res.status(400).send({message:err})
	}
})

// list failed auctions, expired auctions which had no bidders
router.get('/all-failed', verifyToken, async(req,res) => {
	try {
		const items = await Item.find({"expiration_time": {"$lt": new Date()}, "bidders.1": {"$exists": false}})

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
	const sellerDetails = await User.find({"_id":{"$eq":req.user}}, {"_id":0,"username":1,email:1})

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
		description:req.body.description,
		condition:req.body.conditoin,
		expiration_time:req.body.expiration_time,
		// the seller puts their own name down as the first bidder
		// this allows them to set a minimum price they are willing to sell their item for
		// if the item has no real bidders, the seller is considdered the "winner"
		bidders:[sellerDetails[0]["username"]],
		bids:req.body.bid
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
	res.send(await Item.find({"_id": {"$eq": req.params.id}}, {"bidders": 1, "bids": 1}))
})

// bid for an item
router.patch('/:id', verifyToken, async(req,res) => {
	const bidderDetails = await User.find({"_id":{"$eq":req.user}}, {"_id":0,"username":1})
	const {error} = itemBidValidation(req.body)
	if (error) {
		return res.status(400).send({message:error['details'][0]['message']})
	}
	itemToBid = Item.findById(req.params.id)
	try {
		const item = await Item.find({"_id": {"$eq": req.params.id}}, {bids: 1, expiration_time: 1})
		const currentHighestBid = item[0]["bids"][item[0]["bids"].length-1]
		if (new Date() > item[0]["expiration_time"]) {
			res.send("This auction has expired")
		} else if (item[0]["bids"] == bidderDetails[0]["username"]) { 
			res.send("Sorry " + bidderDetails[0]["username"] + ", you cannot bid for the item you are selling.")
		} else if (currentHighestBid >= req.body.bid) { 
			res.send("Your bid is too low! It must be greater than the current highest bid: " 
				+ currentHighestBid)
		} else {
			const result = await Item.findByIdAndUpdate(req.params.id, { $push: {bidders: bidderDetails[0]["username"], bids: req.body.bid} }, {new: true})
			res.send(result)
		}
	} catch (error) {
		console.log(error.message)
	}
})

module.exports = router
