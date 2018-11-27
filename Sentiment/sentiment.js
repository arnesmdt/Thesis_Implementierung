const Sentiment = require('sentiment');
const sentiment = new Sentiment();

getSentiment = function (tweets) {
// Ergebnis-Objekt
    const res = tweets;

    res.nodes.forEach(function (node) {
        //Sentiment bestimmen
        let result = sentiment.analyze(node.text);
        //Sentimentwert als Knotenattribut speichern
        node['sentiment'] = result.score;
    });

    return res;
};

// Exporte des Moduls
module.exports = {
    getSentiment: getSentiment
};