const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const tweets = require("./twitterAPI/twitterAPI");


const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static(path.join(__dirname, '/dashboard')));


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/dashboard', 'dashboard.html'));
});


app.get('/tweets', function (req, res) {
    res.send(JSON.stringify(tweets.tweetObj));
});


app.post('/search', function(req, res) {
    response = {
        searchTerm:req.body.searchTerm,
        searchAmount:req.body.searchAmount
    };

    tweets.init(response.searchTerm, response.searchAmount);

    res.end(JSON.stringify(response));
});


app.listen(3000, function () {
    console.log('Port is 3000. URL is http://localhost:3000/');
});



