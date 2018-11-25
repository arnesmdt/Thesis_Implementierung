const Sentiment = require('sentiment');
const sentiment = new Sentiment();

getSentiment = function (tweets) {
// Ergebnis-Objekt
    const res = tweets;

    res.nodes.forEach(function (node) {
        let result = sentiment.analyze(node.text);
        //result.comparative für normierten wert
        node['sentiment'] = result.score;
    });

    return res;
};


// Exporte des Moduls
module.exports = {
    getSentiment: getSentiment
};