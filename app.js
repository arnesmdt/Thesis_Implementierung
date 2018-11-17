const express = require('express');
const app = express();

const path = require('path');

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static(path.join(__dirname, '/dashboard')));

const tweets = require("./twitterAPI/twitterAPI");


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

    tweets.init(response.searchTerm);

    res.end(JSON.stringify(response));
});


app.listen(3000, function () {
    console.log('Port is 3000. URL is http://localhost:3000/');
});



