if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const mysql = require('mysql2')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const qrcode = require('qrcode')
const ip = require('ip')
const https = require('https')
const app = express()
const port = 3000
const host = ip.address()

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'QCATDB'
}).promise()

//register function to users database
async function registerUser(name, email, password){
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword])
    return result
}

//function to generate a non repeating integer id for classes array
function generateId(){
    let id = Math.floor(Math.random() * 1000000000)
    while (classes.some(classes => classes.id === id)){
        id = Math.floor(Math.random() * 1000000000)
    }
    return id
}

//login function from users database
async function login(name, email, password){
    const result = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (result.length > 0){
        const user = result[0]
        const validPassword = await bcrypt.compare(password, user.password)
        if (validPassword){
            return user
        } else{
            return null
        }
    } else{
        return null
    }
}

//get user id from database
async function getUserById(id){
    const result = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    if (result.length > 0){
        return result[0]
    } else{
        return null
    }
}

//get user name from database
async function getUserByName(name){
    const result = await pool.query('SELECT * FROM users WHERE name = ?', [name])
    if (result.length > 0){
        return result[0]
    } else{
        return null
    }
}

//get user email from database
async function getUserByEmail(email){
    const result = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (result.length > 0){
        return result[0]
    } else{
        return null
    }
}

//function to store data into attendance table
async function storeAttendance(qrCodeData){
    const result = await pool.query('INSERT INTO attendance (qrdata) VALUES (?)', [qrCodeData])
    return result
}

//admin password 123

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('certificate.pem')
}

const users = [
    {
    id: 'function now() { [native code] }',
    name: 'admin',
    email: 'admin@gmail.com',
    password: '$2b$10$OSszd6DlUslG0Y6dOA3/Qenpq3JiWc4MP3IR8oc9.A2xa47tytWFK'
    }
]

const classes = []

const initializePassport = require('./passport-config')

//initialize passport using getUserByEmail and getUserById functions
// initializePassport(
//     passport,
//     email => getUserByEmail(email),
//     id => getUserById(id)
// )


initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    // email => User.findOne({email: email}),
    // id => User.findById(id)
)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

var date = new Date();
var dateString = date.toISOString();

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {
        name: req.user.name,
        date: dateString
    })

})

//app post for index.ejs that will store class data into classes array when a button from index.ejs is clicked
app.post('/', checkAuthenticated, (req, res) => {
    
    classes.push({
        id: generateId(),
        name: req.body.className,
        subject: req.body.classSubject,
        description: req.body.classDescription
    })
    console.log(classes)
})

app.get('/qr-scan', checkAuthenticated, (req, res) => {
    res.render('qr-scan.ejs')
})

app.post('/qr-code', (req, res) => {
    const qrCodeData = req.body.result;
    storeAttendance(qrCodeData);
    //Tue Apr 11 2023 16:12:42 GMT+0800 
    //export user here (the one who scan) get id,fname,lname

    //insert qrCodeData into database
    //insert into attendance values (qrcode and user)

    console.log(`QR Code data submitted: ${qrCodeData}`);
    // Do something with the QR code data, e.g. save it to a database
  
    res.redirect('/');
  });


app.get('/qr-code', checkAuthenticated, (req, res) => {
    const currentDate = new Date().toString();
    qrcode.toDataURL(currentDate, (err, url) => {
      if (err) throw err;
      res.render('qr-code', { qrUrl: url });
    })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now.toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        // registerUser(req.body.name, req.body.email, req.body.password)

        // console.log(user).
        res.redirect('/login')
    } catch (e) {
        console.log(e.message)
        res.redirect('/register')
    }
    // console.log(users)
})

app.delete('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login')
    })
})

function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

const server = https.createServer(options, app)

server.listen(port, host, function(error){
    if(error){
        console.log('Something went wrong', error)
    } else{
        console.log(`Server is listening at http://${host}:${port}/`)
        console.log(`Server is listening at https://${host}:${port}/`)
    }
})