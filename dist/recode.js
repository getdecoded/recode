(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Recode = require('./recode');

module.exports = window.Recode = Recode;



},{"./recode":4}],2:[function(require,module,exports){
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
    console.log(lineLength);
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
}

module.exports = Helper;

},{}],3:[function(require,module,exports){
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

},{"./recode":4}],4:[function(require,module,exports){
var Helper = require('./helper');

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var Recode = module.exports = function(options) {
    if (!options.element) {
        throw new Error('Must supply element in Recode options');
    }

    if (!options.recorddata) {
        throw new Error('Must supply recorddata in Recode options');
    }

    options = this.options = Helper.extend({ }, Recode.defaultOptions, options);

    var self = this;

    this.element = options.element;
    this.recorddata = options.recorddata;
    this.files = [];

    this.playing = false;
    this.requestid = null;

    this.currentTime = 0;
    this.lastActionTime = 0;
    this.lastTime = 0;
    this.lastTimestamp = (new Date()).getTime();
    this.currentIndex = 0;

    var codeTags = this.element.getElementsByTagName('code');
    var removearray = [];
    var newline = /\r\n|\n\r|\n|\r/g;

    Array.prototype.forEach.call(codeTags, function(obj, num) {
        var filepath = obj.getAttribute('data-filepath'), fileobj = { selections: [ { position: { row: 0, col: 0 }, length: { row: 0, col: 0 } } ] };
        if (!filepath) {
            throw new Error('<code> tag must have a data-filepath attribute');
        }

        fileobj.path = filepath;
        fileobj.initialcontent = obj.innerHTML.replace(newline, '\n');
        fileobj.currentContent = fileobj.initialcontent;

        self.files.push(fileobj);
        removearray.push(obj);
    });

    removearray.forEach(function(obj) {
        obj.parentNode.removeChild(obj);
    });

    this.currentFile = this.files[0];
    this.adapter = new Recode.adapters[this.options.adapter](this);
};

Recode.prototype.playrender = function() {
    var now = (new Date()).getTime(),
        difference = now - this.lastTimestamp,
        self = this;

    this.lastTimestamp = now;
    this.lastTime = this.currentTime;
    this.currentTime += difference;

    this.render();

    if (this.playing) {
        this.requestid = requestAnimationFrame(function() {
            Recode.prototype.playrender.call(self);
        });
    }
};

Recode.prototype.render = function() {
    var self = this, updated = false;

    for(i = this.currentIndex + 1; i < this.recorddata.recorded.length; i ++) {
        var ev = this.recorddata.recorded[i],
            file = this.currentFile;

        if (this.currentTime - this.lastActionTime >= ev.distance) {
            updated = true;
            this.lastActionTime += ev.distance;
            this.currentIndex += 1;

            switch (ev.mode) {
                case 0:
                    var removed = Helper.removeString(file.currentContent, Helper.coordsToIndex(file.currentContent, ev.position.row, ev.position.col), Helper.coordsToIndex(file.currentContent, ev.position.row + ev.length.row, ev.position.col + ev.length.col));
                    file.currentContent = Helper.insertString(removed, ev.data.join('\n'), Helper.coordsToIndex(removed, ev.position.row, ev.position.col));
                    this.adapter.changeText(ev.data, ev.position, ev.length);
                    break;
                case 1:
                    // Change selection
                    this.currentFile.selections[0] = {
                        position: {
                            row: ev.position.row,
                            col: ev.position.col
                        }, length: {
                            row: ev.length.row,
                            col: ev.length.col
                        }
                    };

                    this.adapter.changeSelection(ev.position, ev.length);
                    break;
                case 2:
                    // Change file
                    this.files.forEach(function(file) {
                        if (file.path === ev.data) {
                            self.currentFile = file;
                        }
                    });
                    this.adapter.changeFile(ev.data, this.currentFile);
                    break;
            }
        } else {
            break;
        }
    }

    if (updated) {
        this.adapter.render();
    }

};

Recode.prototype.play = function() {
    var self = this;
    this.playing = true;
    this.lastTimestamp = (new Date()).getTime();
    this.requestid = requestAnimationFrame(function() {
        Recode.prototype.playrender.call(self);
    });
};

Recode.prototype.pause = function() {
    this.playing = false;
    cancelAnimationFrame(this.requestid);
    this.requestid = null;
};

Recode.adapters = { };
Recode.defaultOptions = {
    adapter: 'pre'
};
Recode.Helper = Helper;

Recode.TextareaAdapter = require('./textarea-adapter');
Recode.PreAdapter = require('./pre-adapter');



},{"./helper":2,"./pre-adapter":3,"./textarea-adapter":5}],5:[function(require,module,exports){
var Recode = require('./recode');
var Helper = Recode.Helper;

var TextareaAdapter = function(recode) {
    this.recode = recode;

    this.element = document.createElement('textarea');
    this.element.setAttribute('disabled', true);
    this.element.innerHTML = recode.files[0].currentContent;
    this.recode.element.appendChild(this.element);
}

TextareaAdapter.prototype.changeText = function(text, position, length) {
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

},{"./recode":4}]},{},[1]);
