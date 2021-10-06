const { v4: uuidv4 } = require('uuid');
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
app.use(bodyParser.json());
const bcrypt = require('bcrypt');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const secrets = require('./secrets.json');

const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const parser = multer({ storage: storage });


const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: '', 
  allowedFormats: ['jpg', 'png'],
});

app.post('/upload', parser.single('image'), function (req, res) {
    console.log(req.file);
    res.status(201);
    res.json(req.file);
});


// You can store key-value pairs in express, here we store the port setting
app.set('port', (process.env.PORT || 80));


app.get('/', (req, res) => {
    res.send('SellnBuy buy stuff');
    
    res.sendStatus(200);
})

//******* SECURITY *******//

//http basic
passport.use(new BasicStrategy((username, password, done) => {
    // Search users for matching user and password
    const searchResult = users.find(user => {
      if (user.username === username) {
        if(bcrypt.compareSync(password, user.password )) {
          return true;
        }
      }
      return false;
    })

    if(searchResult != undefined) {
      done(null, searchResult); // successfully authenticated
    } else {
      done(null, false); // no credential match
    }
  }
));

//JWT
const  options =  {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secrets.jwtSignKey
}
passport.use(new JwtStrategy(options, (payload, done) => {
// do something wiht the payload
console.log();
//pass the control to the handler methods
done(null, {});
}));

//login with username and password gives you a token
app.post('/login', passport.authenticate('basic', { session: false }),(req, res) => {

    //create a JWT for the client //values to save have to be in the body
    const token = jwt.sign({firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email}, secrets.jwtSignKey);

    //send the JWT to the client
    res.json({ token: token });
})


//******* USERS *******//

//for programmer only
// Get all users, no login needed
app.get('/users', (req, res) => { 
   res.json(users);
})


//array of users
let users = [];

// Create a new user 
app.post('/users', (req, res) => {
  let date = new Date();
  const salt = bcrypt.genSaltSync(6);
  const hashedPassword = bcrypt.hashSync(req.body.password, salt);
  users.push({ 
    userId: uuidv4(), 
    username: req.body.username, 
    firstName: req.body.firstName, 
    lastName: req.body.lastName, 
    email: req.body.email, 
    password: hashedPassword, 
    dateOfBirth: req.body.dateOfBirth, 
    signUpDate: date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() 
  });
  res.sendStatus(201);
})

// Retrieve the all the information of the user with the matching username, HTTP BASIC
app.get('/users/:userId', passport.authenticate('basic', { session: false }), (req, res) => {
    const user = users.find(u => u.userId === req.params.userId)
    if (user === undefined) {
      res.sendStatus(404);
    } else {
      res.json(user);
    }
})

// Update the information of an existing user, HTTP BASIC
app.patch('/users/:userId', passport.authenticate('basic', { session: false }), (req, res) => {
    const user = users.find(u => u.userId === req.params.userId)
    if (user === undefined) {
      res.sendStatus(404);
    } else {
      const salt = bcrypt.genSaltSync(6);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);

      user.username = req.body.username;
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;
      user.password = hashedPassword;
      user.dateOfBirth = req.body.dateOfBirth;
      console.log(req.body);
      res.sendStatus(202);
    }
})

// Delete a specific user,HTTP BASIC
app.delete('/users/:userId',passport.authenticate('basic', { session: false }), (req, res) => {

  const user = users.findIndex(d => d.userId === req.params.userId)
    if (user === -1) {
      res.sendStatus(404);
    } else {
      users.splice(user, 1);
      res.sendStatus(202);
    }
})


//******* POSTS *******//

let posts = [];

// Create a new post, HTTP BASIC 
app.post('/users/:username/posts',passport.authenticate('basic', { session: false }), (req, res) => {
  const user = users.find(u => u.username === req.params.username)
  if (user === undefined) {
    res.sendStatus(404);
  } else {
    let date = new Date();
    console.log(req.body);

    posts.push({ 

      postId: uuidv4(),
      title: req.body.title, 
      description: req.body.description, 
      category: req.body.category, 
      askingPrice: req.body.askingPrice, 
      location: req.body.location, 
      deliveryType: req.body.deliveryType,  
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      dateOfPosting: date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() }),
      
    res.sendStatus(201);
    }
})

//upload images to specific post using postId, HTTP BASIC 
app.post('/users/:username/posts/:postId/uploadimages', passport.authenticate('basic', { session: false }), upload.array('images', 4), function (req, res, next) {
  const user = users.find(u => u.username === req.params.username)
  if (user === undefined) {
    res.sendStatus(404);
  } else {  
   const post = posts.find(p => p.postId === req.params.postId)
   if (post === undefined) {
    res.sendStatus(404);
   } else {
    post.images = [{ images: req.body, images: req.files }];
    console.log(req.body);
    console.log(req.files);
    res.sendStatus(200);
   }
  }
})

// Modify a post, HTTP BASIC
app.patch('/users/:username/posts/:postId', passport.authenticate('basic', { session: false }), (req, res) => {
  const user = users.find(u => u.username === req.params.username)
  if (user === undefined) {
    res.sendStatus(404);
  } else { 
    const post = posts.find(p => p.postId === req.params.postId)
    if (post === undefined) {
      res.sendStatus(404);
    } else { 
      post.title = req.body.title;
      post.description = req.body.description;
      post.category = req.body.category;
      post.askingPrice = req.body.askingPrice;
      post.location = req.body.location;
      post.deliveryType = req.body.deliveryType;
      console.log(req.body);
      res.sendStatus(202);
    }
  }
})

//change new images to specific post using postId, HTTP BASIC 
app.put('/users/:username/posts/:postId/uploadimages', passport.authenticate('basic', { session: false }), upload.array('images', 4), function (req, res, next) {
  const user = users.find(u => u.username === req.params.username)
  if (user === undefined) {
    res.sendStatus(404);
  } else { 
  const post = posts.find(p => p.postId === req.params.postId)
   if (post === undefined) {
     res.sendStatus(404);
   } else {
     post.images = [{ images: req.body, images: req.files }];
     console.log(req.body);
     console.log(req.files);
     res.sendStatus(202);
   }
  }
 })
 

// Delete a post, HTTP BASIC
app.delete('/users/:username/posts/:postId', (req, res) => {
  const user = users.find(u => u.username === req.params.username)
  if (user === undefined) {
    res.sendStatus(404);
  } else {
  const post = posts.findIndex(d => d.postId === req.params.postId)
    if (post === -1) {
      res.sendStatus(404);
    } else {
      posts.splice(post, 1);
      res.sendStatus(202);
      }
    }
  })


// Get all posts
app.get('/posts', (req, res) => { 
  res.json(posts);
})


// Search for information about a specific post using postID
app.get('/posts/:postId', (req, res) => {

    const post = posts.find(d => d.postId === req.params.postId)
    if (post === undefined) {
      res.sendStatus(404);
    } else {
      res.json(post);
    }
})

// Get specific posts using search
app.get('/posts/search/', (req, res) => {
  /*const location = posts.find(l => l.lockation === req.params.location)
  if (location === undefined) {
    res.sendStatus(404);
  } else {
    res.json(user);
  }*/
  console.log(req.query);
})

// start listening for incoming HTTP connections
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
/*
app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})
*/
