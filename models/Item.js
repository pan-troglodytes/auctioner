const mongoose = require('mongoose')

const itemScema = mongoose.Schema({
	title: {
		type:String
	},
	timestamp: {
		type:Date,
		default:Date.now
	},
	condition: {
		type:String
	},
	description: {
		type:String
	},
	expiration_time: {
		type:Date,
		default:Date.now
	},
	highest_bidder: {
		type:[String]
	},
	highest_bid_gbp: {
		type:[Number]
	},
	seller: {
		type:String
	}
})

module.exports = mongoose.model('items', itemScema)
