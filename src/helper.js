var Helper = { };

// Thanks kennebec
// http://stackoverflow.com/a/14482123/1136593
Helper.nthIndex = function(str, pat, n){
    var L= str.length, i= -1;
    while(n-- && i++<L){
        i= str.indexOf(pat, i);
    }
    return i;
};

Helper.coordsToIndex = function(text, row, col) {
    return Helper.nthIndex(text, '\n', row) + 1 + col;
};

Helper.insertString = function(text, sub, position) {
    return [text.slice(0, position), sub, text.slice(position)].join('');
};

Helper.removeString = function(text, pos1, pos2) {
    return text.slice(0, pos1) + text.slice(pos2);
};

// Thanks CMS
// http://stackoverflow.com/a/499158/1136593
Helper.setSelectionRange = function(input, selectionStart, selectionEnd) {
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
};

// Thanks Ryan Lynch
// http://stackoverflow.com/a/11197343/1136593
Helper.extend = function() {
    for(var i=1; i<arguments.length; i++) {
        for(var key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) {
                arguments[0][key] = arguments[i][key];
            }
        }
    }
    return arguments[0];
}

module.exports = Helper;
