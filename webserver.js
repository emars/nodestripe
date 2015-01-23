var express = require('express');
var app = express();

app.use(express.static(__dirname+'/assets'));

app.get('/', function(req, res){
	res.sendFile(__dirname+'/assets/index.html');
});

app.listen(5001, function(){
	console.log('testing listening on 5001');
});
