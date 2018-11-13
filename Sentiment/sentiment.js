var Sentiment = require('sentiment');
var sentiment = new Sentiment();

getSentiment = function (tweets) {
// Ergebnis-Objekt
    var res = tweets;

    res.nodes.forEach(function (node) {
        var result = sentiment.analyze(node.text);

        if (result.score < 0)
            node['group'] = 1;
        else if (result.score > 0)
            node['group'] = 2;
        else
            node['group'] = 3;
    });

    return res;
};


// Exporte des Moduls
module.exports = {
    getSentiment: getSentiment
};