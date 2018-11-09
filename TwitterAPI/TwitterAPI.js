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


T.get('search/tweets', searchparams, function(err, data, response) {
    // If there is no error, proceed
    if(!err){
        // Loop through the returned tweets
        for(var i = 0; i < data.statuses.length; i++){
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
            if(tweet.hasOwnProperty('retweeted_status')){
                createNode(tweetId_str, username, 1);
                createNode(retweet.id_str, retweet.user.screen_name, 3);
                res.links.push({source:tweetId_str, target: retweet.id_str, type: 'retweet', value: 1});
            }

            // Reply
            if(in_reply_to_status_str !== null){
                createNode(tweetId_str, username, 1);
                getTweet(in_reply_to_status_str, tweetId_str, 'reply');
            }

            // Qoute
            if(tweet.hasOwnProperty('quoted_status_id_str')){
                createNode(tweetId_str, username, 1);
                getTweet(quoted_status_id_str, tweetId_str, 'quote');
            }

            /*
            Author:
            Wenn bereits ein Tweet des Authors des momentan betrachteten Tweets existiert,
            dann füge den aktuell betrachteten Knoten hinzu und verbinde alle bereits vorhandenen
            Tweets des Authors mit dem aktuell betrachteten Knoten
             */
            var user_nodes = res.nodes.filter(function(nodes){ return nodes.username === username });

            if(user_nodes.length > 0){
                createNode(tweetId_str, username, 1);
                user_nodes.forEach(function(element) {
                    if(tweetId_str !== element.id){
                        res.links.push({source:tweetId_str, target: element.id, type: 'author', value: 10});
                    }
                });
            }
        }

    } else {
        console.log(err);
    }
});


// Tweet an Hand seiner ID heraussuchen
function getTweet(tweetID_parent, tweetID_origin, type){
    T.get('statuses/show/' + tweetID_parent, function(err, data, response) {
        if(!err){
            var username = data.user.screen_name;
            var tweetId_str = data.id_str;

            createNode(tweetId_str, username , 2);
            res.links.push({source:tweetID_origin, target: tweetId_str, type: type, value: 1});

            console.log(tweetId_str + " - " + type);
        }else {
            console.log(err);
        }
    });
}


// Knoten hinzufügen
function createNode(tweetID, userName , group){
    var link = "https://twitter.com/" + userName + "/status/" + tweetID;

    // Prüfen, ob der Knoten mit der gewünschten ID bereits vorhanden ist
    if(! (res.nodes.filter(function(nodes){ return nodes.id === tweetID }).length > 0)){
        res.nodes.push({id:tweetID, username: userName, link:link, group: group});
    }
}


// Exporte des Moduls
module.exports = {
    tweetObj: res
};