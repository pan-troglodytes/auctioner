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
		condition:joi.string().required().min(3).max(256),
		description:joi.string().required().min(10).max(1024),
		expiration_time:joi.date().required(),
		bid:joi.number().required()
	})
	return schemaValidation.validate(data)
}

const itemBidValidation = (data) => {
	const schemaValidation = joi.object({
		bid:joi.number().required()
	})
	return schemaValidation.validate(data)
}
module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
module.exports.itemAuctionValidation = itemAuctionValidation
module.exports.itemBidValidation = itemBidValidation
