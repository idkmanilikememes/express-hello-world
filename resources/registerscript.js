const socket = io('https://derp45.onrender.com:3080/')
const RegisterForm = document.getElementById('register-forum')
const usernameInput = document.getElementById('input-username')
const password1Input = document.getElementById('input-password1')
const password2Input = document.getElementById('input-password2')

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

RegisterForm.addEventListener('submit', e => {
  e.preventDefault()
  const username = usernameInput.value
  const password1 = password1Input.value
  const password2 = password2Input.value
  socket.emit('register', {"username":username,"password1":password1,"password2":password2})
  //console.log(message)
  usernameInput.value = ''
  password1Input.value = ''
  password2Input.value = ''
})