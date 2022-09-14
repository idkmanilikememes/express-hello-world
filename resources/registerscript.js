const socket = io('https://derp45.onrender.com/')
const RegisterForm = document.getElementById('register-forum')
const usernameInput = document.getElementById('input-username')
const password1Input = document.getElementById('input-password1')
const password2Input = document.getElementById('input-password2')
const error = document.getElementById('error-message')

socket.on('logged-in', data => {
  console.log(data)
  //appendMessage(data)
  if (data['success'] == false) {
    error.innerHTML = '<br><div class="alert alert-danger" role="alert">'+data['reason']+'</div>'
  } else {
    error.innerHTML = '<br><div class="alert alert-success" role="alert"> registered successfully. redirecting back home </div>'
    setInterval(function(){location.replace("https://derp45.onrender.com/")},500);
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