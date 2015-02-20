var Recode = require('./recode');
var Helper = Recode.Helper;

var PreAdapter = function(recode) {
    this.recode = recode;

    this.element = document.createElement('pre');
    this.element.className = 'recode-text';
    this.element.innerHTML = recode.files[0].currentContent;
    this.recode.element.appendChild(this.element);
}

PreAdapter.prototype.changeText = function(text, position, length) {
    // Nothing to see here
};

PreAdapter.prototype.changeSelection = function(position, length) {
    // Nothing to see here
};

PreAdapter.prototype.changeFile = function(filepath, file) {
    // Nothing to see here
};

PreAdapter.prototype.render = function() {
    var file = this.recode.currentFile;

    var first = Helper.coordsToIndex(file.currentContent, file.selections[0].position.row, file.selections[0].position.col),
        second = Helper.coordsToIndex(file.currentContent, file.selections[0].position.row + file.selections[0].length.row, file.selections[0].position.col + file.selections[0].length.col), beginning, end;

    if (first <= second) {
        beginning = first;
        end = second;
    } else {
        beginning = second;
        end = first;
    }

    var elemOpen = '<span class="recode-selection">';

    if (beginning == end) {
        elemOpen = '<span class="recode-caret">';
    }

    this.element.innerHTML = Helper.escapeHtml(file.currentContent.slice(0, beginning)) + elemOpen
        + Helper.escapeHtml(file.currentContent.slice(beginning, end)) + '</span>'
        + Helper.escapeHtml(file.currentContent.slice(end));
};

Recode.adapters.pre = PreAdapter;
module.exports = PreAdapter;
