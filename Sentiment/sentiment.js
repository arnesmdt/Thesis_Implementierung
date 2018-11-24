const Sentiment = require('sentiment');
const sentiment = new Sentiment();

getSentiment = function (tweets) {
// Ergebnis-Objekt
    const res = tweets;

    res.nodes.forEach(function (node) {
        let result = sentiment.analyze(node.text);
        //result.comparative für normierten wert
        node['sentiment'] = result.score;

        /*
        //negativ
        if (result.score < 0)
            node['group'] = 1;
        // positiv
        else if (result.score > 0)
            node['group'] = 2;
        // neutral
        else
            node['group'] = 3;
        */
    });

    return res;
};


// Exporte des Moduls
module.exports = {
    getSentiment: getSentiment
};