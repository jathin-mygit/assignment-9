const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mogoose = require('mongoose');
const encrypt = require('mongoose-encryption')
const { default: mongoose } = require('mongoose');

const app = express();

// Setup user authentication session
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    // Check if user is authenticated based on request headers, query parameters, or body
    if (req.headers.isLoggedIn === 'true' || req.query.isLoggedIn === 'true' || req.body.isLoggedIn === 'true') {
        return next();
    }
    // If not authenticated, redirect to login page
    res.redirect('/login');
};
mongoose.connect('mongodb+srv://fakeaddress2202:vF7cKDZz8GKUpPi9@tasks.d8jyvby.mongodb.net/?retryWrites=true&w=majority&appName=tasks')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
const tryschema = new mongoose.Schema({
    email : String,
    password : String
})

const secretSchema = new mongoose.Schema({
    content: String
})

const secret = "this is little secrete";
tryschema.plugin(encrypt, {secret : secret ,encryptedFields : ["password"]});
const item = mongoose.model('second', tryschema);
const Secret = mongoose.model('Secret', secretSchema);
app.get('/', function(req, res){
    res.render('home');
})
app.post('/register', function(req, res){
    const newUser = new item({
        email : req.body.username,
        password : req.body.password
    })
    newUser.save()
        .then(() => {
            // Automatically log in after successful registration
            res.redirect('/secrete?isLoggedIn=true');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/register');
        })
})

app.post('/login', function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    
    console.log('Login attempt:', username);
    
    // Check if username and password are provided
    if (!username || !password) {
        console.log('Missing credentials');
        return res.render('login', { error: 'Please provide both email and password' });
    }

    // Using lean() would bypass the decryption, so we use the default mongoose document
    item.findOne({email : username})
        .then((founduser) => {
            if(!founduser) {
                console.log('User not found:', username);
                return res.render('login', { error: 'Incorrect username or password' });
            }
            
            // The mongoose-encryption plugin automatically decrypts the password
            // when we access it as a property on the mongoose document
            console.log('Comparing passwords for:', username);
            
            if(founduser.password === password){
                console.log('Login successful:', username);
                // Send authentication flag in the redirect URL
                res.redirect('/secrete?isLoggedIn=true');
            } else {
                console.log('Incorrect password for:', username);
                console.log('Expected:', founduser.password, 'Received:', password);
                res.render('login', { error: 'Incorrect username or password' });
            }
        })
        .catch(err => {
            console.error('Login error:', err);
            res.render('login', { error: 'An error occurred during login. Please try again.' });
        });
})
app.get('/login', function(req, res){
    res.render('login');
})
app.get('/register', function(req, res){
    res.render('register');
})

app.get('/logout', function(req, res){
    // User is logging out, redirect to home without auth flag
    res.redirect('/');
})

app.get('/secrete', isAuthenticated, function(req, res){
    Secret.find()
        .then(foundSecrets => {
            res.render('secrete', { secrets: foundSecrets, isLoggedIn: true });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/');
        });
})

app.get('/submit', isAuthenticated, function(req, res){
    res.render('submit', { isLoggedIn: true });
})

app.post('/submit', isAuthenticated, function(req, res){
    const newSecret = new Secret({
        content: req.body.secreat
    });
    
    newSecret.save()
        .then(() => {
            // Stay on the same page and show success message
            res.render('submit', { 
                isLoggedIn: true, 
                message: 'Secret submitted successfully!'
            });
        })
        .catch(err => {
            console.log(err);
            res.render('submit', { 
                isLoggedIn: true, 
                error: 'Error saving your secret.'
            });
        });
})

app.listen(3000, function(){
    console.log('Website running at : http://localhost:3000');
})