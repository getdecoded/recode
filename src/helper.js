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

// Returns the
Helper.nthIndexRegex = function(str, pat, n){
    var L= str.length, i= -1, match;
    while (((match = pat.exec(str)) != null) && (n--)) {
        i = match.index;
    }
    return i;
};

Helper.coordsToIndex = function(text, row, col) {
    var firstIndex = Helper.nthIndex(text, '\n', row);
    var secondIndex = Helper.nthIndex(text, '\n', row + 1);
    var lineLength = (secondIndex >= 0 ? secondIndex : text.length) - (firstIndex >= 0 ? firstIndex : 0);
    return (firstIndex >= 0 ? firstIndex + 1 : 0) + Math.min(col, lineLength);
};

Helper.insertString = function(text, sub, position) {
    return [text.slice(0, position), sub, text.slice(position)].join('');
};

Helper.removeString = function(text, pos1, pos2) {
    return text.slice(0, pos1) + text.slice(pos2);
};

// Thanks Kip
// http://stackoverflow.com/a/4835406/1136593
Helper.escapeHtml = function(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

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
};

Helper.simplifyLanguageMappings = function(map) {
    var newmap = { };
    map.forEach(function(ob) {
        ob.names.forEach(function(name) {
            newmap[name] = ob.mode;
        });
    });
    return newmap;
};

module.exports = Helper;
