var Twitter = require('twitter');
var config = require('./TwitterConfig.js');

var T = new Twitter(config);

// Suchparameter festlegen
var searchparams = {
    q: '#wiesbaden',
    count: 100,
    lang: 'de'
};

var result = {
    tweets: []
};

// Ergebnis-Objekt
var res ={
    nodes: [],
    links: []
};

initial = function () {
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
                var in_reply_to_status_str = tweet.in_reply_to_status_id_str;
                var quoted_status_id_str = tweet.quoted_status_id_str;

                /*
                            result.tweets.push({
                                username: username,
                                tweetId: tweetId,
                                tweetId_str: tweetId_str,
                                in_reply_to_status: in_reply_to_status,
                                quoted_status:quoted_status_id,
                                retweet:retweet,
                                link: link
                            });
                */

                // Retweet
                if (tweet.hasOwnProperty('retweeted_status')) {
                    createNode(tweetId_str, username, 1);
                    createNode(retweet.id_str, retweet.user.screen_name, 3);
                    createLink(tweetId_str, retweet.id_str, 'retweet', 1);
                }

                // Reply
                if (in_reply_to_status_str !== null) {
                    createNode(tweetId_str, username, 1);
                    getTweet(in_reply_to_status_str, tweetId_str, 'reply');
                }

                // Qoute
                if (tweet.hasOwnProperty('quoted_status_id_str')) {
                    createNode(tweetId_str, username, 1);
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

            createNode(tweetId_str, username , 2);
            createLink(tweetID_origin, tweetId_str, type, 1);

            console.log(tweetId_str + " - " + type);
        }else {
            console.log(err);
        }
    });
}


// Knoten hinzufügen
function createNode(tweetID, userName , group){
    // Link generieren
    var url = "https://twitter.com/" + userName + "/status/" + tweetID;
    //Doppelte suchen
    var doppelte = res.nodes.filter(function(nodes){ return nodes.id === tweetID });
    // Prüfen, ob der Knoten mit der gewünschten ID bereits vorhanden ist
    if(doppelte.length === 0){
        res.nodes.push({id:tweetID, username: userName, url:url, group: group});
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
    tweetObj: res, init: initial
};