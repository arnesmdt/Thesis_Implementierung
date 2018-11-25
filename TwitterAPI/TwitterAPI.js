const Twitter = require('twitter');
const config = require('./TwitterConfig.js');
const sentiment = require("./../Sentiment/sentiment");

const T = new Twitter(config);

// Ergebnis-Objekt
let res ={
    nodes: [],
    links: []
};


initial = async function (searchTerm, searchAmount) {
    // initiierung
    let searchparams = {};
    let lowestId = 9999999999999999999;
    res.nodes = [];
    res.links = [];

    // Wie viele Beiträge sollen maximal gespeichert werden?
    let maxnodes = searchAmount;
    // Wie viele Beiträge sollen im nächsten Durchlauf herausgesucht werden (Maximum = 100)?
    let count = 0;
    // Wie viele Beiträge wurden bisher gespeichert?
    let countTotal = 0;

    // Jeder Durchlauf ist ein Suchauftrag an die Twitter API (Maximum sind 100 Tweets pro Durchlauf)
    while (countTotal <= maxnodes) {

        if (maxnodes - countTotal >= 100){
            count = 100;
        }
        else if (maxnodes - countTotal < 100 && maxnodes - countTotal > 0){
            count = maxnodes - countTotal;
        }
        else
            break;

        searchparams  = {
            q: searchTerm,
            count: count,
            lang: 'en',
            max_id: lowestId
        };

        // Tweets über Twitter API suchen und verarbeiten
        const data = await searchTweets(searchparams);
        lowestId = await resolveTweets(data);

        console.log("Anzahl Knoten: " + res.nodes.length + " Anzahl Kanten: " + res.links.length);

        // Suche abbrechen, wenn keine weiteren Beiträge gefunden werden
        if(res.nodes.length < (countTotal + count))
            break;
        else
            countTotal = res.nodes.length;
    }

    getAuthorConnections();
    getSentiment();
    // wenn nach get sentiment noch was passieren soll muss auf getsentiment gewartet werden

};


// Ermittelt den Sentiment für alle Knoten
function getSentiment(){
    res = sentiment.getSentiment(res);
}


// Verbindung zwischen zwei Tweets des gleichen Authors herstellen
function getAuthorConnections(){
    res.nodes.forEach(function(node1) {
        const user_nodes = res.nodes.filter(function(nodes){ return nodes.username === node1.username});

        if(user_nodes.length > 0){
            user_nodes.forEach(function(node2) {
                if(node1.id !== node2.id){
                    // zweiseitige verbindung
                    createLink(node1.id, node2.id, 'author', 5);
                    createLink(node2.id, node1.id, 'author', 5);
                }
            });
        }
    });
}


// Tweets an Hand der Suchparameter über die TwitterAPI heraussuchen
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


/*
Jeder Tweet wird als Knoten gespeichert.
Die Funktion gibt den ältesten Tweet (kleinste ID) zurück.
 */

async function resolveTweets(data) {
    let lowestId = 9999999999999999999;
    // Loop through the returned tweets
    for (let i = 0; i < data.statuses.length; i++) {
        const tweet = data.statuses[i];
        const retweet = tweet.retweeted_status;

        const username = tweet.user.screen_name;
        const tweetId_str = tweet.id_str;
        const tweetText = tweet.text;
        const in_reply_to_status_str = tweet.in_reply_to_status_id_str;
        const quoted_status_id_str = tweet.quoted_status_id_str;

        createNode(tweetId_str, username, tweet.favorite_count, tweet.retweet_count, tweetText);

        // Retweet
        if (tweet.hasOwnProperty('retweeted_status')) {
            createNode(retweet.id_str, retweet.user.screen_name, retweet.favorite_count, retweet.retweet_count, retweet.text);
            createLink(tweetId_str, retweet.id_str, 'retweet', 5);
        }

        // Reply
        if (in_reply_to_status_str !== null) {
            const dataReply = await searchTweet(in_reply_to_status_str, tweetId_str);
            resolveTweet(dataReply, 'reply');
        }

        // Qoute
        if (tweet.hasOwnProperty('quoted_status_id_str')) {
            const dataQoute = await searchTweet(quoted_status_id_str, tweetId_str);
            resolveTweet(dataQoute, 'quote');
        }

        if(tweet.id < lowestId)
            lowestId = tweet.id;
    }

    return lowestId;
}


// Einzelnen Tweet an Hand seiner ID über die TwitterAPI heraussuchen
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


// Tweet speichern
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