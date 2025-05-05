const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mogoose = require('mongoose');
const encrypt = require('mongoose-encryption')
const { default: mongoose } = require('mongoose');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
mongoose.connect('mongodb+srv://fakeaddress2202:vF7cKDZz8GKUpPi9@tasks.d8jyvby.mongodb.net/?retryWrites=true&w=majority&appName=tasks');
const tryschema = new mongoose.Schema({
    email : String,
    password : String
})

const secret = "this is little secrete";
tryschema.plugin(encrypt, {secret : secret ,encryptedFields : ["password"]});
const item = mongoose.model('second', tryschema);
app.get('/', function(req, res){
    res.render('home');
})
app.post('/register', function(req, res){
    const newUser = new item({
        email : req.body.username,
        password : req.body.password
    })
    newUser.save().then(res.render("secrete"))
    .catch(err =>{
        console.log(err)
    })
})

app.post('/login', function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    item.findOne({email : username}).then((founduser) =>{
        if(founduser.password == password){
            res.render('secrete')
        }
    })
    .catch(err =>{
        console.log(err)
    })
         
    
})
app.get('/login', function(req, res){
    res.render('login');
})
app.get('/register', function(req, res){
    res.render('register');
})

app.listen(3000, function(){
    console.log('Website running at : http://localhost:3000');
})