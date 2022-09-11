const socket = io('https://derp45.onrender.com:3080/')
const LoginForm = document.getElementById('login-forum')
const usernameInput = document.getElementById('input-username')
const passwordInput = document.getElementById('input-password')

socket.on('logged-in', data => {
  //console.log(data)
  //appendMessage(data)
  if (data == false) {
    console.log("login fail!")
  } else {
    document.cookie = "session-id="+data.cookie;
    document.cookie = "name="+data.name;
  }
});

LoginForm.addEventListener('submit', e => {
  e.preventDefault()
  const username = usernameInput.value
  const password = passwordInput.value
  socket.emit('login', {"username":username,"password":password})
  //console.log(message)
  usernameInput.value = ''
  passwordInput.value = ''
})