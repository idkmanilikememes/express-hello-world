const socket = io('https://derp45.onrender.com/')
const LoginForm = document.getElementById('login-forum')
const usernameInput = document.getElementById('input-username')
const passwordInput = document.getElementById('input-password')
const error = document.getElementById('error-message')

socket.on('logged-in', data => {
  //console.log(data)
  //appendMessage(data)
  if (data['success'] == false) {
    //console.log("login fail!")
    error.innerHTML = '<br><div class="alert alert-danger" role="alert">'+data['reason']+'</div>'

  } else {
    error.innerHTML = '<br><div class="alert alert-success" role="alert"> logged in successfully. redirecting back home </div>'
    setInterval(function(){location.replace("https://derp45.onrender.com/")},2000);
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