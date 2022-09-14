const background = document.getElementById('body')
var i = 0;
body.style = "background-color:hsl(0, 0%, 0%);"

var intervalId = window.setInterval(function(){
  	i += 1;
	body.style = "background-color:hsl("+i+", 5%, 50%);"
}, 30);