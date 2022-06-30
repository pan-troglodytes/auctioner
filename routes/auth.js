const express = require('express')
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')
const cors = require('cors')

const router = express.Router()
const User = require('../models/User')
const {registerValidation, loginValidation} = require('../validations/validation')

router.get('/', cors(), async(req,res) => {
	try {
		const users = await User.find({},{"username":1})
		console.log(users)
		res.send(users)
	} catch(err) {
		res.status(400).send({message:err})
	}
})

router.post('/register', cors(), async(req,res) => {

	// validation to check user input
	const {error} = registerValidation(req.body)
	if (error) {
		return res.status(400).send({message:error['details'][0]['message']})
	}
	const userExists = await User.findOne({username:req.body.username})
	if (userExists) {
		return res.status(400).send({message:"already registered accout with this name"})
	}
	// hash the password
	const salt = await bcryptjs.genSalt(5)
	const hashedPassword = await bcryptjs.hash(req.body.password, salt)

	
	// insert data
	const user = new User({
		username:req.body.username,
		email:req.body.email,
		password:hashedPassword
	})
	try {
		const savedUser = await user.save()
		res.send(savedUser)
	} catch (err) {
		res.status(400).send({message:err})
	}
})

router.post('/login', cors(), async(req,res) => {
	// validation 1, check email
	const {error} = loginValidation(req.body)
	if (error) {
		return res.status(400).send({message:error['details'][0]['message']})
	}

	// validation 2, check if user exists
	const user = await User.findOne({username:req.body.username})
	if (!user) {
		return res.status(400).send({message:"user does not exist"})
	}

	// validation 3, check password
	const passwordValidation = await bcryptjs.compare(req.body.password, user.password)
	if (!passwordValidation) {
		return res.status(400).send({message:'password is wrong'})
	}

	// generate an auth-token
	const token = jsonwebtoken.sign({_id:user._id}, process.env.TOKEN_SECRET)
	res.header('auth-token', token).send({'auth-token':token})
})


module.exports = router
