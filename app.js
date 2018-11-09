var express = require('express');
var app = express();

var path = require('path');

var tweets = require("./TwitterAPI/TwitterAPI");


app.use(express.static(path.join(__dirname, '/graph')));


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/graph', 'graph.html'));
});

app.get('/tweets', function (req, res) {
    res.send(JSON.stringify(tweets.tweetObj));
});

app.listen(3000, function () {
    console.log('Port is 3000. URL is http://localhost:3000/');
});



