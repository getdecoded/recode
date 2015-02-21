var Recode = require('./recode');
var Helper = Recode.Helper;

var AceAdapter = function(recode) {
    this.recode = recode;
}

AceAdapter.prototype.changeText = function(text, position, length) {
    // Nothing to see here
};

AceAdapter.prototype.changeSelection = function(position, length) {
    // Nothing to see here
};

AceAdapter.prototype.changeFile = function(filepath, file) {
    // Change language
};

AceAdapter.prototype.render = function() {
    // Render it
};

/*AceAdapter.languageMappings = [
    {
        names: ['html', 'htm'],
        mode: 'htmlmixed'
    },
    {
        names: ['js'],
        mode: 'javascript'
    }
];*/

Recode.adapters.ace = AceAdapter;
module.exports = AceAdapter;
