const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const flash = require('express-flash')
const session = require('express-session')
const validate = require('mongoose-validator')

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static(path.join(__dirname, './static')))
app.use(session({
  secret: 'keyboardkitteh',
  name: 'session_id',
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
  }
}))
app.use(flash())

app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'ejs')

mongoose.connect('mongodb://localhost/message-board')

let CommentSchema = new mongoose.Schema({
  commenter: {
    type: String,
    required: [true, 'Please enter your name']
  },
  comment: {
    type: String,
    required: [true, 'Please enter your comment']
  }
}, {
  timestamps: true
})

let PostSchema = new mongoose.Schema({
  author: {type: String, required: [true, 'Please enter your name']},
  contents: {type: String, required: [true, 'Please enter your message.']},
  comments: []
}, {timestamps: true})

let UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name.']
  },
  posts: [PostSchema],
  comments: [CommentSchema]
}, {
  timestamps: true
})

mongoose.model('Post', PostSchema)
const Post = mongoose.model('Post')

mongoose.model('Comment', CommentSchema)
const Comment = mongoose.model('Comment')

mongoose.model('User', UserSchema)
const User = mongoose.model('User')

app.get('/', function(req, res) {
  res.render('login')
})
app.post('/login', function(req, res) {
  req.session.name = req.body.name
  console.log(req.session.name)
  res.redirect('/posts')
})


app.get('/posts', function(req, res) {
  Post.find({}, null, {sort: {createdAt: -1}}, function(err, messages) {
    if (err) {
      console.log(err)
      res.render('error')
    } else {
      console.log('Loading Messages Success')
      console.log(messages)
      res.render('index', {
        messages: messages
      })
    }
  })
})


app.post('/add-message', function(req, res) {
  let post = new Post({
    author: req.body.author,
    contents: req.body.contents,
    comments: []
  })
  post.save(function(err) {
    if (err) {
      // Handle Errors
    } else {
      console.log('Post successful')
      res.redirect('/posts')
    }
  })
})

app.post('/destroy/:id', function(req, res) {
  Post.findByIdAndDelete(req.params.id, function(err) {
    if (err) {
      console.log('Error deleting')
      res.redirect('/posts')
    } else {
      console.log('message deleted')
      res.redirect('/posts')
    }
  })
})

app.post('/add-comment', function(req, res) {
  let comment = new Comment({
    commenter: req.body.commenter,
    comment: req.body.comment
  })
  console.log(comment)
  console.log(req.body)
  comment.save(function(err) {
    if (err) {
      // Handle Errors
    } else {
      Post.findOneAndUpdate({_id: req.params.id}, {$push: {comments: comment}}, function(err) {
        if (err) {
          // console.log('Error adding comment to post')
        } else {
          // console.log(comment)
          // console.log('Post found. Comment added to post')
          res.redirect('/posts')
        }
      })
    }
  })
})


app.listen(3791, function() {
  console.log('***************************')
  console.log('One Ring to Rule the Server')
  console.log('********** 3791 ***********')
})
