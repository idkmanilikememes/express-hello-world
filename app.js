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

const users = [] //array of cookies used for users to login
const usernames = [] //array of usernames that have logged in
const messages = []
const socketids = [] //array of socket ids (different from cookies) used to login (null if offline)

process.env.PORT = 3001

app.get("/", (req, res) => { //main page
  res.sendFile(path.join(__dirname , 'resources', 'index.html'));
});

app.get("/memes", (req, res) => { //main page
  res.sendFile(path.join(__dirname , 'resources', 'memes.html'));
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

    socket.on('error', (err) => {
      console.log('error caught:' + err.message);
    });

    socket.on('disconnect', (data, err) => {
      if (err) {console.log('disconnect error: '+err)} else {
        if (socketids.includes(socket.id)) {
          console.log(usernames[socketids.indexOf(socket.id)]+' just left NO. socketid: ' + socket.id)
          socketids[socketids.indexOf(socket.id)] = null;
          socket.broadcast.emit('update-onlines', {users: socketids, usernames: usernames})
        }
      }
    })

    socket.on('check-cookies', cookie => {
      if (users.includes(xssFilters.inHTMLData(cookie))) {
        socketids[users.indexOf(xssFilters.inHTMLData(cookie))] = socket.id;
        console.log(usernames[users.indexOf(xssFilters.inHTMLData(cookie))]+' just joined YES'+socket.request.connection.remoteAddress)
        console.log('socket ids: '+socketids)
        tryemit('old-connection',{messages: messages, users: socketids, usernames: usernames}, socket)
        socket.broadcast.emit('update-onlines', {users: socketids, usernames: usernames})
      } else {
        tryemit('new-connection',{messages: messages, users: socketids, usernames: usernames}, socket)
        socket.broadcast.emit('update-onlines', {users: socketids, usernames: usernames})
      }
    })
    
    socket.on('login', creds => { //log a user in mate
      //check that user exists in database
      try {
        console.log('logging someone in');
        database.query({text: `SELECT * FROM toads WHERE handle = '`+xssFilters.inHTMLData(creds['username'])+`';`,}).then((res, err) => {
          if (err) {
            console.log('db error caught: '+err)
          } else {
            userinfo = res.rows[0]; //set userinfo to the first row of query
            if (userinfo !== undefined) {
              if (xssFilters.inHTMLData(creds['password']) == userinfo['password']) {
                //console.log('successfully logged in')
                //successfully logged in
                var cookie = makeid(30) //set id cookie of user
                while (users.includes(cookie)) { //make sure not already in use
                  cookie = makeid(30)
                }

                //check if user already in users list and then add them in appropriately
                if (usernames.includes(xssFilters.inHTMLData(creds['username']))) {
                  users[usernames.indexOf(xssFilters.inHTMLData(creds['username']))] = cookie;
                  socketids[usernames.indexOf(xssFilters.inHTMLData(creds['username']))] = socket.id;
                } else {
                  users.push(cookie);
                  socketids.push(socket.id);
                  usernames.push(xssFilters.inHTMLData(creds['username']));
                }
                tryemit('logged-in',{success: true, cookie: cookie, name: xssFilters.inHTMLData(creds['username'])}, socket)
              } else {
                //console.log('wrong password dumby')
                //wrong password
                tryemit('logged-in',{success: false, reason: 'wrong password dumby'}, socket)
              }
            } else {
              //console.log('user does not exist')
              //user does not exist
              tryemit('logged-in',{success: false, reason: 'that user does not exist moron'}, socket)
            }
          }
        })
      } catch(e) {
        console.log('login error caught: '+e);
      }
    })

    socket.on('register', creds => { //register new user
      //check that user exists in database
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
                    tryemit('logged-in',{success: true, cookie: cookie, name: xssFilters.inHTMLData(creds['username'])}, socket)
                    console.log(database.query({text: `SELECT * FROM toads`}));
                  } else {
                    tryemit('logged-in',{success: false, reason: 'handle already in use, sorry king!'}, socket)
                  }
                })
              //} else {
              //  socket.emit('logged-in',{success: false, reason: 'do not make more than one account please '+res.rows[0]['handle']})
              //}
            //})
          } else {
            tryemit('logged-in',{success: false, reason: 'passwords do not match idiot'}, socket)
          }
        } else {
          tryemit('logged-in',{success: false, reason: 'passwords must not exceed 50 characters soz'}, socket)
        }
      } else {
        tryemit('logged-in',{success: false, reason: 'usernames must not exceed 16 characters soz'}, socket)
      }
    })

    socket.on('send-chat-message', message => { //message recieved
      var cookies = cookie.parse(xssFilters.inHTMLData(socket.handshake.headers.cookie));
      if (cookies['session-id'] !== null && users.includes(cookies['session-id'])) {
        message = usernames[users.indexOf(cookies['session-id'])]+": "+xssFilters.inHTMLData(message);
        console.log(message)
        tryemit('chat-message', message, socket)
        socket.broadcast.emit('chat-message', message)
        messages.push(message);
      }
    })
  })


server.listen(process.env.PORT, () => {
  console.log('listening on *:3001');
});

function makeid(length) { //make an id for user
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
} 

function tryemit(name, message, socket) {
  try {
    socket.emit(name, message);
  } catch (e) {
    console.log('emit error caught: '+e);
  }
}