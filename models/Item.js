const mongoose = require('mongoose')

const itemScema = mongoose.Schema({
	title: {
		type:String
	},
	description: {
		type:String
	},
	condition: {
		type:String
	},
	expiration_time: {
		type:Date,
		default:Date.now
	},
	bidders: {
		type:[String]
	},
	bids: {
		type:[Number]
	}
})

module.exports = mongoose.model('items', itemScema)
