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

        if(result.score < 0)
            node['value'] = 1;
        else if(result.score > 0)
            node['value'] = 2;
        else
            node['value'] = 3;

    });

    return res;
};

// Exporte des Moduls
module.exports = {
    getSentiment: getSentiment
};