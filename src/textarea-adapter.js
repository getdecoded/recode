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

    var first = coordsToIndex(file.currentContent, file.selections[0].position.row, file.selections[0].position.col),
        second = coordsToIndex(file.currentContent, file.selections[0].position.row + file.selections[0].length.row, file.selections[0].position.col + file.selections[0].length.col);

    if (first < second) {
        setSelectionRange(this.element, first, second);
    } else if (first > second) {
        setSelectionRange(this.element, second, first);
    } else {
        // Disabled textareas don't like this
        // But the implementation is buggy anyway
        // So this is here as a reminder
        setSelectionRange(this.element, first, first);
    }
};


// Thanks kennebec
// http://stackoverflow.com/a/14482123/1136593
function nthIndex(str, pat, n){
    var L= str.length, i= -1;
    while(n-- && i++<L){
        i= str.indexOf(pat, i);
    }
    return i;
}

function coordsToIndex(text, row, col) {
    return nthIndex(text, '\n', row) + 1 + col;
}

function insertString(text, sub, position) {
    return [text.slice(0, position), sub, text.slice(position)].join('');
}

function removeString(text, pos1, pos2) {
    return text.slice(0, pos1) + text.slice(pos2);
}

// Thanks CMS
// http://stackoverflow.com/a/499158/1136593
function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

module.exports = TextareaAdapter;
