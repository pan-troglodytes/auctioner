const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

const mongoose = require('mongoose')
const bodyParser = require('body-parser')

app.use(bodyParser.json())
require('dotenv/config')

const itemRoute = require('./routes/items')
const authRoute = require('./routes/auth')
app.use('/api/items', itemRoute)
app.use('/api/user', authRoute)

app.get("/", cors(), async(req, res) => {
	console.log("hello world")
	res.send("hhello world")
})
mongoose.connect(process.env.DB_CONNECTOR, () => {
	console.log('DB is connected')
})

app.listen(3001, () => {
	console.log('Server is running')
})
