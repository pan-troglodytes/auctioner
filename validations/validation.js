const joi = require('joi')
const registerValidation = (data) => {
	const schemaValidation = joi.object({
		username:joi.string().required().min(3).max(256),
		email:joi.string().required().min(6).max(256).email(),
		password:joi.string().required().min(6).max(1024),
	})
	return schemaValidation.validate(data)
}

const loginValidation = (data) => {
	const schemaValidation = joi.object({
		username:joi.string().required().min(3).max(256),
		password:joi.string().required().min(6).max(1024),
	})
	return schemaValidation.validate(data)
}

const itemAuctionValidation = (data) => {
	const schemaValidation = joi.object({
		title:joi.string().required().min(3).max(256),
		timestamp:joi.date().required(),
		condition:joi.string().required().min(3).max(256),
		description:joi.string().required().min(10).max(1024),
		expiration_time:joi.date().required(),
		highest_bidder:joi.array().items(joi.string().required().min(3).max(256)).required().min(1).max(1),
		highest_bid_gbp:joi.array().items(joi.number().required().min(0)).required().min(1).max(1),
		seller:joi.string().required().min(3).max(256)
	})
	return schemaValidation.validate(data)
}

const itemBidValidation = (data) => {
	const schemaValidation = joi.object({
		highest_bidder:joi.string().required().min(3).max(256),
		highest_bid_gbp:joi.required()
	})
	return schemaValidation.validate(data)
}
module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
module.exports.itemAuctionValidation = itemAuctionValidation
module.exports.itemBidValidation = itemBidValidation
