const socket = io('http://localhost:3080/')
const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const messageBox = document.getElementById('message-box')

socket.on('chat-message', data => {
  //console.log(data)
  appendMessage(data)
})

socket.on('connected', data => {
  if (getCookie("session-id") !== null) {
    socket.emit('check-cookies', getCookie("session-id"))
  } else {
    socket.emit('check-cookies', "hi i'm new")
  }
})

socket.on('new-connection', messages => {
  messageContainer.innerHTML = "";
  for (var i = 0; i <= messages.length-1; i++) {
    appendMessage(messages[i]);
  }
  document.cookie = "";
  messageBox.innerHTML = '<br><div class="alert alert-danger" role="alert">you must be <a style="color: inherit;" href="/login">logged in</a> to use chat</div>'
})

socket.on('old-connection', messages => {
  console.log('old connection')
  messageContainer.innerHTML = "";
  for (var i = 0; i <= messages.length-1; i++) {
    appendMessage(messages[i]);
  }
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  socket.emit('send-chat-message', message)
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