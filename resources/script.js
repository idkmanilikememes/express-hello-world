const socket = io('http://localhost:3001/')
const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const messageBox = document.getElementById('message-box')
const onlineUsersBox = document.getElementById('online-users')

socket.on('chat-message', data => {
  //console.log(data)
  appendMessage(data)
})

if (getCookie("session-id") !== null) {
  socket.emit('check-cookies', getCookie("session-id"))
} else {
  socket.emit('check-cookies', "hi i'm new")
}

socket.on('new-connection', data => {
  messageContainer.innerHTML = "";
  for (var i = 0; i <= data.messages.length-1; i++) {
    appendMessage(data.messages[i]);
  }
  document.cookie = "";
  messageBox.innerHTML = '<br><div class="alert alert-danger" role="alert">you must be <a style="color: inherit;" href="/login">logged in</a> to use chat</div>'

  console.log('broken')
  //onlineUsersBox.innerHTML = "";
  for (var i = 0; i < data.users.length; i++) {
    console.log(data.users[i])
    if (data.users[i]) {
      if (i % 6 === 0 && i !== 0) { //break after 6
        linebreak = document.createElement("br");
        onlineUsersBox.appendChild(linebreak);
      }
      imgcontainer = document.createElement('div')
      imgcontainer.style = 'display: inline';
      imgcontainer.classList.add('cont');
      img = document.createElement('img')
      img.src = 'default.png';
      img.style = 'background-color:'+getRandomColor()+';height:50px;border-radius: 50%;';
      imgoverlay = document.createElement('div')
      imgoverlay.classList.add('overlay')
      imgoverlay.style = 'display: inline'
      imgoverlaytext = document.createElement('div')
      imgoverlaytext.style = 'display: inline'
      imgoverlaytext.classList.add('text')
      imgoverlaytext.innerText = data.usersnames[i]
      imgoverlay.append(imgoverlaytext)
      imgcontainer.append(imgoverlay)
      imgcontainer.append(img)
      onlineUsersBox.append(imgcontainer)
    }
  }
  
})

socket.on('old-connection', data => {
  console.log('old connection')
  messageContainer.innerHTML = "";
  for (var i = 0; i <= data.messages.length-1; i++) {
    appendMessage(data.messages[i]);
  }
  
  //onlineUsersBox.innerHTML = "";
  for (var i = 0; i < 20; i++) {
    if (i % 6 === 0 && i !== 0) { //break after 6
      linebreak = document.createElement("br");
      onlineUsersBox.appendChild(linebreak);
    }
    imgcontainer = document.createElement('div')
    imgcontainer.style = 'display: inline';
    imgcontainer.classList.add('cont');
    img = document.createElement('img')
    img.src = 'default.png';
    img.style = 'background-color:'+getRandomColor()+';height:50px;border-radius: 50%;';
    imgoverlay = document.createElement('div')
    imgoverlay.classList.add('overlay')
    imgoverlay.style = 'display: inline'
    imgoverlaytext = document.createElement('div')
    imgoverlaytext.style = 'display: inline'
    imgoverlaytext.classList.add('text')
    imgoverlaytext.innerText = data.usersnames[i]
    imgoverlay.append(imgoverlaytext)
    imgcontainer.append(imgoverlay)
    imgcontainer.append(img)
    onlineUsersBox.append(imgcontainer)
  }
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  if (message !== '') {
    socket.emit('send-chat-message', message)
  }
  //console.log(message)
  messageInput.value = ''
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function getRandomColor() {
  var letters = '456789ABCD';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 10)];
  }
  return color;
}