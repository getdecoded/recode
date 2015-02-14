var TextareaAdapter = function(recode) {
    this.recode = recode;

    this.element = document.createElement('textarea');
    this.element.setAttribute('disabled', true);
    this.element.innerHTML = recode.files[0].currentContent;
    this.recode.element.appendChild(this.element);
}

TextareaAdapter.prototype.insertText = function(text, position) {
    var file = this.recode.currentFile;

    file.currentContent = insertString(file.currentContent, text, coordsToIndex(file.currentContent, position.row, position.col));
    this.element.innerHTML = file.currentContent;
};

TextareaAdapter.prototype.removeText = function(position, length) {
    var file = this.recode.currentFile;

    file.currentContent = removeString(file.currentContent, coordsToIndex(file.currentContent, position.row, position.col), coordsToIndex(file.currentContent, position.row + length.row, position.col + length.col));
    this.element.innerHTML = file.currentContent;
};

TextareaAdapter.prototype.changeSelection = function(position, length) {
    var first = coordsToIndex(this.recode.currentFile.currentContent, position.row, position.col),
        second = coordsToIndex(this.recode.currentFile.currentContent, position.row + length.row, position.col + length.col);

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

TextareaAdapter.prototype.changeFile = function(filepath, file) {
    this.element.innerHTML = file.currentContent;
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
