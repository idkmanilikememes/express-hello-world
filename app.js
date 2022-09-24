//main server dependences
const express = require("express");
const app = express();
app.use(express.static(__dirname + '/resources'));
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var xssFilters = require('xss-filters'); //sanatizer

const cookie = require("cookie")
const path = require('path');

const users = []
const usernames = []
const messages = []
const socketids = []

process.env.PORT = 3001

app.get("/", (req, res) => { //main page
  res.sendFile(path.join(__dirname , 'resources', 'index.html'));
});

app.get("/login", (req, res) => { //login page
  res.sendFile(path.join(__dirname , 'resources', 'login.html'));
});

app.get("/register", (req, res) => { //register page
  res.sendFile(path.join(__dirname , 'resources', 'register.html'));
});

app.get("/jackquest", (req, res) => { //register page
  res.sendFile(path.join(__dirname , 'resources', 'games/jackquest/index.html'));
});


//this is database shit, initiallisign ing it
  const { Client } = require('pg');
  const database = new Client({
    connectionString: 'postgres://epicness_user:Ql9Ks2Ax592y5WTmV8CH6w1K4WlkXGsf@dpg-cccp166n6mpkorrfdv20-a.oregon-postgres.render.com/epicness?ssl=true',
  })
  database.connect(err => { //connect to db
    if (err) {
      console.error('db connection error', err.stack)
    } else {
      console.log('db connected')
    }
  })

function dbquery(query) {
  var result
  database.query(query, (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      console.log(res)
    }
  })
  return result
  //query function for all queries to user db
}

//socket.io server crap
  io.on('connection', socket => {

    socket.on('disconnect', data => {
      if (socketids.includes(socket.id)) {
        console.log(socketids)
        console.log(usernames[socketids.indexOf(socket.id)]+' just left NO')
        socketids[socketids.indexOf(socket.id)] = null;
        socket.broadcast.emit('update-onlines', {users: socketids, usernames: usernames})
        console.log(socketids)
      }
    })

    socket.on('check-cookies', cookie => {
      if (users.includes(xssFilters.inHTMLData(cookie))) {
        socketids[users.indexOf(xssFilters.inHTMLData(cookie))] = socket.id;
        console.log(usernames[users.indexOf(xssFilters.inHTMLData(cookie))]+' just joined YES')
        console.log(socketids)
        socket.emit('old-connection',{messages: messages, users: socketids, usernames: usernames})
        socket.broadcast.emit('update-onlines', {users: socketids, usernames: usernames})
      } else {
        socket.emit('new-connection',{messages: messages, users: socketids, usernames: usernames})
        socket.broadcast.emit('update-onlines', {users: socketids, usernames: usernames})
      }
    })
    
    socket.on('login', creds => { //log a user in mate
      //check that user exists in database
      database.query({text: `SELECT * FROM toads WHERE handle = '`+xssFilters.inHTMLData(creds['username'])+`';`,}).then(res => {
        userinfo = res.rows[0]; //set userinfo to the first row of query
        if (userinfo !== undefined) {
          if (xssFilters.inHTMLData(creds['password']) == userinfo['password']) {
            //console.log('successfully logged in')
            //successfully logged in
            const cookie = makeid(30) //set id cookie of user
            while (users.includes(cookie)) { //make sure not already in use
              cookie = makeid(30)
            }
            users.push(cookie);
            socketids.push(socket.id);
            usernames.push(xssFilters.inHTMLData(creds['username']));
            socket.emit('logged-in',{success: true, cookie: cookie, name: xssFilters.inHTMLData(creds['username'])})
          } else {
            //console.log('wrong password dumby')
            //wrong password
            socket.emit('logged-in',{success: false, reason: 'wrong password dumby'})
          }
        } else {
          //console.log('user does not exist')
          //user does not exist
          socket.emit('logged-in',{success: false, reason: 'that user does not exist moron'})
        }
      })
    })

    socket.on('register', creds => { //register new user
      //check that user exists in database
      console.log(xssFilters.inHTMLData(creds['username']).length);
      if (xssFilters.inHTMLData(creds['username']).length < 16) {
        if (xssFilters.inHTMLData(creds['password1']).length < 50) {
          if (xssFilters.inHTMLData(creds['password1']) == xssFilters.inHTMLData(creds['password2'])) { //check both passwords are equal
            //check if ip has already registered
            //database.query({text: `SELECT * FROM toads WHERE ip = '`+String(socket.handshake.address)+`';`,}).then(res => {
              //if (res.rows[0] == undefined) {
                database.query({text: `SELECT * FROM toads WHERE handle = '`+xssFilters.inHTMLData(creds['username'])+`';`,}).then(fes => {
                  if (fes.rows[0] == undefined) {
                    //add user to database with sql query
                    database.query({text: `INSERT INTO toads(handle,nname,password) VALUES($1,$2,$3)`, values: [xssFilters.inHTMLData(creds['username']), creds['username'], creds['password1']]})
                    
                    const cookie = makeid(30) //set id cookie of user
                    while (users.includes(cookie)) { //make sure not already in use
                      cookie = makeid(30)
                    }
                    users.push(cookie);
                    socketids.push(socket.id);
                    usernames.push(xssFilters.inHTMLData(creds['username']));
                    socket.emit('logged-in',{success: true, cookie: cookie, name: xssFilters.inHTMLData(creds['username'])})
                    console.log(database.query({text: `SELECT * FROM toads`}));
                  } else {
                    socket.emit('logged-in',{success: false, reason: 'handle already in use, sorry king!'})
                  }
                })
              //} else {
              //  socket.emit('logged-in',{success: false, reason: 'do not make more than one account please '+res.rows[0]['handle']})
              //}
            //})
          } else {
            socket.emit('logged-in',{success: false, reason: 'passwords do not match idiot'})
          }
        } else {
          socket.emit('logged-in',{success: false, reason: 'passwords must not exceed 50 characters soz'})
        }
      } else {
        socket.emit('logged-in',{success: false, reason: 'usernames must not exceed 16 characters soz'})
      }
    })

    //socket.emit('chat-message','Hello buddy, welcome to the toadchat.')

    socket.on('send-chat-message', message => { //message recieved
      var cookies = cookie.parse(xssFilters.inHTMLData(socket.handshake.headers.cookie));
      if (cookies['session-id'] !== null && users.includes(cookies['session-id'])) {
        message = usernames[users.indexOf(cookies['session-id'])]+": "+xssFilters.inHTMLData(message);
        console.log(message)
        socket.emit('chat-message', message)
        socket.broadcast.emit('chat-message', message)
        messages.push(message);
      }
    })
  })


server.listen(process.env.PORT, () => {
  console.log('listening on *:3001');
});

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
} //make an id for user