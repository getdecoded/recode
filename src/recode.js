var TextareaAdapter = require('./textarea-adapter');

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

var Recode = function(element, recorddata) {
    var self = this;

    this.element = element;
    this.recorddata = recorddata;
    this.files = [];

    this.playing = false;
    this.requestid = null;

    this.currentTime = 0;
    this.lastActionTime = 0;
    this.lastTime = 0;
    this.lastTimestamp = (new Date()).getTime();
    this.currentIndex = 0;

    var codeTags = this.element.getElementsByTagName('code'), removearray = [];

    Array.prototype.forEach.call(codeTags, function(obj, num) {
        var filepath = obj.getAttribute('data-filepath'), fileobj = { };
        if (!filepath) {
            throw new Error('<code> tag must have a data-filepath attribute');
        }

        fileobj.path = filepath;
        fileobj.initialcontent = obj.innerHTML;
        fileobj.currentContent = obj.innerHTML;

        self.files.push(fileobj);
        removearray.push(obj);
    });

    removearray.forEach(function(obj) {
        obj.parentNode.removeChild(obj);
    });

    this.currentFile = this.files[0];
    this.adapter = new TextareaAdapter(this);
};

Recode.prototype.playrender = function() {
    var now = (new Date()).getTime(),
        difference = now - this.lastTimestamp,
        self = this;

    this.lastTimestamp = now;
    this.lastTime = this.currentTime;
    this.currentTime += difference * 10;

    this.render();



    if (this.playing) {
        this.requestid = requestAnimationFrame(function() {
            Recode.prototype.playrender.call(self);
        });
    }
};

Recode.prototype.render = function() {
    var self = this;

    for(i = this.currentIndex + 1; i < this.recorddata.recorded.length; i ++) {
        var ev = this.recorddata.recorded[i],
            file = this.currentFile;

        if (this.currentTime - this.lastActionTime >= ev.distance) {
            this.lastActionTime += ev.distance;
            this.currentIndex += 1;

            switch (ev.mode) {
                case 0:
                    this.adapter.insertText(ev.data, ev.position);
                    break;
                case 1:
                    this.adapter.removeText(ev.position, ev.length);
                    break;
                case 2:
                    // Change selection
                    this.adapter.changeSelection(ev.position, ev.length);
                    break;
                case 3:
                    // Change file
                    this.files.forEach(function(file) {
                        console.log(file.path, ev.data, file.path == ev.data);
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

};

Recode.prototype.play = function() {
    var self = this;
    this.playing = true;
    this.requestid = requestAnimationFrame(function() {
        Recode.prototype.playrender.call(self);
    });
};

Recode.prototype.pause = function() {
    this.playing = false;
    cancelAnimationFrame(this.requestid);
    this.requestid = null;
};

module.exports = Recode;
