var Twitter = require('twitter');
var config = require('./TwitterConfig.js');

var T = new Twitter(config);

// Ergebnis-Objekt
var res ={
    nodes: [],
    links: []
};

initial = function (searchTerm) {
    // Suchparameter festlegen
    var searchparams = {
        q: searchTerm,
        count: 100,
        lang: 'en'
    };

    res.nodes = [];
    res.links = [];

    searchTweets(searchparams);
};

function searchTweets(searchparams) {
    T.get('search/tweets', searchparams, function (err, data, response) {
        // If there is no error, proceed
        if (!err) {
            // Loop through the returned tweets
            for (var i = 0; i < data.statuses.length; i++) {
                var tweet = data.statuses[i];
                var retweet = tweet.retweeted_status;

                var username = tweet.user.screen_name;
                var tweetId_str = tweet.id_str;
                var tweetText = tweet.text;
                var in_reply_to_status_str = tweet.in_reply_to_status_id_str;
                var quoted_status_id_str = tweet.quoted_status_id_str;

                var retweet_count = tweet.retweet_count;
                var favorite_count = tweet.favorite_count;

                // Retweet
                if (tweet.hasOwnProperty('retweeted_status')) {
                    createNode(tweetId_str, username, favorite_count, retweet_count, tweetText);
                    createNode(retweet.id_str, retweet.user.screen_name, retweet.favorite_count, retweet.retweet_count, retweet.text);
                    createLink(tweetId_str, retweet.id_str, 'retweet', 5);
                }

                // Reply
                if (in_reply_to_status_str !== null) {
                    createNode(tweetId_str, username, favorite_count, retweet_count, tweetText);
                    getTweet(in_reply_to_status_str, tweetId_str, 'reply');
                }

                // Qoute
                if (tweet.hasOwnProperty('quoted_status_id_str')) {
                    createNode(tweetId_str, username, favorite_count, retweet_count, tweetText);
                    getTweet(quoted_status_id_str, tweetId_str, 'quote');
                }
            }

            // Author
            getAuthorConnections();

        } else {
            console.log(err);
        }
    });
}

// Verbindung zwischen zwei Tweets des gleichen Authors herstellen
function getAuthorConnections(){
    res.nodes.forEach(function(node1) {
        var user_nodes = res.nodes.filter(function(nodes){ return nodes.username === node1.username});

        if(user_nodes.length > 0){
            user_nodes.forEach(function(node2) {
                if(node1.id !== node2.id){
                    // zweiseitige verbindung
                    createLink(node1.id, node2.id, 'author', 10);
                    createLink(node2.id, node1.id, 'author', 10);
                }
            });
        }
    });
}


// Tweet an Hand seiner ID heraussuchen
function getTweet(tweetID_parent, tweetID_origin, type){
    T.get('statuses/show/' + tweetID_parent, function(err, data, response) {
        if(!err){
            var username = data.user.screen_name;
            var tweetId_str = data.id_str;
            var retweet_count = data.retweet_count;
            var favorite_count = data.favorite_count;
            var tweetText =  data.text;

            createNode(tweetId_str, username, favorite_count, retweet_count, tweetText);
            createLink(tweetID_origin, tweetId_str, type, 5);
        }else {
            console.log(err);
        }
    });
}


// Knoten hinzufügen
function createNode(tweetID, userName, retweets, favorites, tweetText){
    // Link generieren
    var url = "https://twitter.com/" + userName + "/status/" + tweetID;
    //Doppelte suchen
    var doppelte = res.nodes.filter(function(nodes){ return nodes.id === tweetID });
    // Prüfen, ob der Knoten mit der gewünschten ID bereits vorhanden ist
    if(doppelte.length === 0){
        res.nodes.push({id:tweetID, username: userName, url:url, favorites:favorites, retweets:retweets, text: tweetText});
    }
}


// Kante hinzufügen
function createLink(tweetID_source, tweetID_target , type, value){
    //Doppelte suchen
    var doppelte = res.links.filter(function(link){
        return (link.source === tweetID_source && link.target === tweetID_target)
    });
    // Prüfen, ob der Link bereits vorhanden ist
    if(doppelte.length === 0){
        res.links.push({source:tweetID_source, target: tweetID_target, type: type, value: value});
    }
}


// Exporte des Moduls
module.exports = {
    tweetObj: res,
    init: initial
};