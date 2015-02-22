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

    if (this.recorddata.varMap) {
        var newRecord = [];
        var invertedKeys = {};

        for (var i in this.recorddata.varMap) {
            invertedKeys[this.recorddata.varMap[i]] = i;
        }

        this.recorddata.recorded.forEach(function(ob, i) {
            var newOb = {};
            for (var i in ob) {
                if (typeof invertedKeys[i] != 'undefined') {
                    newOb[invertedKeys[i]] = ob[i];
                } else {
                    newOb[i] = ob[i];
                }
            }

            newRecord.push(newOb);
        });

        this.recorddata.recorded = newRecord;
    }


    this.playing = false;
    this.requestid = null;

    this.currentTime = 0;
    this.lastActionTime = 0;
    this.lastTime = 0;
    this.lastTimestamp = (new Date()).getTime();
    this.currentIndex = -1;

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
Recode.CodeMirrorAdapter = require('./codemirror-adapter');
Recode.AceAdapter = require('./ace-adapter');

Recode.Recoder = require('./recoder');


