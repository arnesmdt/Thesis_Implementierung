const Twitter = require('twitter');
const config = require('./TwitterConfig.js');

const T = new Twitter(config);

// Ergebnis-Objekt
let res ={
    nodes: [],
    links: []
};

initial = async function (searchTerm) {
    // Suchparameter festlegen
    const searchparams = {
        q: searchTerm,
        count: 100,
        lang: 'en'
    };

    res.nodes = [];
    res.links = [];


    const data = await searchTweets(searchparams);
    const data2 = await resolveTweets(data);
    getAuthorConnections(data2);
    getSentiment();

};

// Ermittelt den Sentiment für alle Knoten
function getSentiment(){
    const sentiment = require("./../Sentiment/sentiment");
    res = sentiment.getSentiment(res);
}


// Verbindung zwischen zwei Tweets des gleichen Authors herstellen
function getAuthorConnections(data){
    data.nodes.forEach(function(node1) {
        const user_nodes = data.nodes.filter(function(nodes){ return nodes.username === node1.username});

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

// Tweets an Hand der Suchparameter heraussuchen
function searchTweets(searchparams) {
    return new Promise((resolve, reject) => {
        T.get('search/tweets', searchparams, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Tweets verarbeiten
async function resolveTweets(data) {
    // Loop through the returned tweets
    for (let i = 0; i < data.statuses.length; i++) {
        const tweet = data.statuses[i];
        const retweet = tweet.retweeted_status;

        const username = tweet.user.screen_name;
        const tweetId_str = tweet.id_str;
        const tweetText = tweet.text;
        const in_reply_to_status_str = tweet.in_reply_to_status_id_str;
        const quoted_status_id_str = tweet.quoted_status_id_str;

        const retweet_count = tweet.retweet_count;
        const favorite_count = tweet.favorite_count;

        // Retweet
        if (tweet.hasOwnProperty('retweeted_status')) {
            createNode(tweetId_str, username, favorite_count, retweet_count, tweetText);
            createNode(retweet.id_str, retweet.user.screen_name, retweet.favorite_count, retweet.retweet_count, retweet.text);
            createLink(tweetId_str, retweet.id_str, 'retweet', 5);
        }

        // Reply
        if (in_reply_to_status_str !== null) {
            createNode(tweetId_str, username, favorite_count, retweet_count, tweetText);
            // getTweet(in_reply_to_status_str, tweetId_str, 'reply');
            const data1 = await searchTweet(in_reply_to_status_str, tweetId_str);
            resolveTweet(data1, 'reply');
        }

        // Qoute
        if (tweet.hasOwnProperty('quoted_status_id_str')) {
            createNode(tweetId_str, username, favorite_count, retweet_count, tweetText);
            // getTweet(quoted_status_id_str, tweetId_str, 'quote');
            const data2 = await searchTweet(quoted_status_id_str, tweetId_str);
            resolveTweet(data2, 'quote');
        }
    }

    return res;
}


// Tweet an Hand seiner ID heraussuchen
function searchTweet(tweetID_parent, tweetID_origin) {
    return new Promise((resolve, reject) => {
        T.get('statuses/show/' + tweetID_parent, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve({data:data, origin: tweetID_origin});
            }
        });
    });
}


// Tweet verarbeiten
function resolveTweet(data, type){
    const username = data.data.user.screen_name;
    const tweetId_str = data.data.id_str;
    const retweet_count = data.data.retweet_count;
    const favorite_count = data.data.favorite_count;
    const tweetText =  data.data.text;

    createNode(tweetId_str, username, favorite_count, retweet_count, tweetText);
    createLink(data.origin, tweetId_str, type, 5);
}


// Knoten hinzufügen
function createNode(tweetID, userName, retweets, favorites, tweetText){
    // Link generieren
    const url = "https://twitter.com/" + userName + "/status/" + tweetID;
    //Doppelte suchen
    const doppelte = res.nodes.filter(function(nodes){ return nodes.id === tweetID });
    // Prüfen, ob der Knoten mit der gewünschten ID bereits vorhanden ist
    if(doppelte.length === 0){
        res.nodes.push({id:tweetID, username: userName, url:url, favorites:favorites, retweets:retweets, text: tweetText});
    }
}


// Kante hinzufügen
function createLink(tweetID_source, tweetID_target , type, value){
    //Doppelte suchen
    const doppelte = res.links.filter(function(link){
        return (link.source === tweetID_source && link.target === tweetID_target && link.type === type)
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