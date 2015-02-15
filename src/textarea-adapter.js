var Recode = require('./recode');
var Helper = Recode.Helper;

console.log(Recode);

var TextareaAdapter = function(recode) {
    this.recode = recode;

    this.element = document.createElement('textarea');
    this.element.setAttribute('disabled', true);
    this.element.innerHTML = recode.files[0].currentContent;
    this.recode.element.appendChild(this.element);
}

TextareaAdapter.prototype.insertText = function(text, position) {
    // Nothing to see here
};

TextareaAdapter.prototype.removeText = function(position, length) {
    // Nothing to see here
};

TextareaAdapter.prototype.changeSelection = function(position, length) {
    // Nothing to see here
};

TextareaAdapter.prototype.changeFile = function(filepath, file) {
    // Nothing to see here
};

TextareaAdapter.prototype.render = function() {
    var file = this.recode.currentFile;

    this.element.innerHTML = file.currentContent;

    var first = Helper.coordsToIndex(file.currentContent, file.selections[0].position.row, file.selections[0].position.col),
        second = Helper.coordsToIndex(file.currentContent, file.selections[0].position.row + file.selections[0].length.row, file.selections[0].position.col + file.selections[0].length.col);

    if (first < second) {
        Helper.setSelectionRange(this.element, first, second);
    } else if (first > second) {
        Helper.setSelectionRange(this.element, second, first);
    } else {
        // Disabled textareas don't like this
        // But the implementation is buggy anyway
        // So this is here as a reminder
        Helper.setSelectionRange(this.element, first, first);
    }
};

Recode.adapters.textarea = TextareaAdapter;
module.exports = TextareaAdapter;
