var express = require('express');
var app = express();

var path = require('path');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static(path.join(__dirname, '/dashboard')));

var tweets = require("./TwitterAPI/TwitterAPI");


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/dashboard', 'dashboard.html'));
});

app.get('/tweets', function (req, res) {
    res.send(JSON.stringify(tweets.tweetObj));
});


app.post('/search', function(req, res) {
    response = {
        searchTerm:req.body.searchTerm
    };

    tweets.init();

    res.end(JSON.stringify(response));
});


app.listen(3000, function () {
    console.log('Port is 3000. URL is http://localhost:3000/');
});



