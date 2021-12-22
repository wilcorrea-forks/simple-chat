const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const Message = mongoose.model('Message', {
  name: String,
  message: String
})

app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages)
  })
})

app.get('/messages/:user', (req, res) => {
  const user = req.params.user
  Message.find({ name: user }, (err, messages) => {
    res.send(messages)
  })
})

app.post('/messages', async (req, res) => {
  try {
    const message = new Message(req.body)

    const savedMessage = await message.save()
    console.log('saved')

    const censored = await Message.findOne({ message: 'badword' })
    if (censored)
      await Message.remove({ _id: censored.id })
    else
      io.emit('message', req.body)
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(500)
    return console.log('error', error)
  } finally {
    console.log('Message Posted')
  }
})

const options = {
  poolSize: 10,
  authSource: 'admin',
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASSWORD,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}

const host = process.env.MONGO_HOST
const database = process.env.MONGO_DATABASE
const callback = (err) => {
  if (err) {
    console.log('mongoose: mongodb error', err)
    process.exit(1)
    return
  }
  console.log('mongoose: mongodb connected')
}
mongoose.connect(`mongodb://${host}/${database}`, options, callback)

io.on('connection', () => {
  console.log('a user is connected')
})

const server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port)
})
