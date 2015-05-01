var Helper = require('./helper');

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function () {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
}());

var Recode = module.exports = function (options) {
  if (!options.element) {
    throw new Error('Must supply element in Recode options');
  }

  if (!options.recorddata) {
    throw new Error('Must supply recorddata in Recode options');
  }

  options = this.options = Helper.extend({}, Recode.defaultOptions, options);

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

    this.recorddata.recorded.forEach(function (ob, i) {
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

  var removearray = [];
  var newline = /\r\n|\n\r|\n|\r/g;

  this.recorddata.files.forEach(function (obj, num) {
    var fileobj = {
      selections: [{
        position: {
          row: 0,
          col: 0
        },
        length: {
          row: 0,
          col: 0
        }
      }]
    };
    var content = '';
    var elem;

    fileobj.path = obj.path;
    fileobj.name = obj.name;

    if (obj.content != null) {
      content = obj.content;
    } else if (elem = document.querySelector('[data-filepath="' + fileobj.path + '"]')) {
      content = elem.innerHTML;
    } else {
      throw new Error('Could not find file contents in recorddata or in element with data-filepath');
    }

    fileobj.initialcontent = content.replace(newline, '\n');
    fileobj.currentContent = fileobj.initialcontent;
    fileobj.language = obj.language;

    self.files.push(fileobj);
  });

  this.element.innerHTML = '';

  this.currentFile = this.files[0];
  this.adapter = new Recode.adapters[this.options.adapter](this, this.adapterOptions || { });
};

Recode.prototype.setTime = function (time) {
  this.lastTime = this.currentTime;
  this.currentTime = time;

  this.render();
};

Recode.prototype.playrender = function () {
  var self = this;
  var now = (new Date()).getTime();
  var difference = now - this.lastTimestamp;

  this.lastTimestamp = now;

  this.setTime(this.currentTime + difference);

  if (this.playing) {
    this.requestid = requestAnimationFrame(function () {
      Recode.prototype.playrender.call(self);
    });
  }
};

Recode.prototype.render = function () {
  var self = this;
  var updated = false;

  for (i = this.currentIndex + 1; i < this.recorddata.recorded.length; i++) {
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
          },
          length: {
            row: ev.length.row,
            col: ev.length.col
          }
        };

        this.adapter.changeSelection(ev.position, ev.length);
        break;
      case 2:
        // Change file
        this.files.forEach(function (file) {
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

Recode.prototype.play = function () {
  var self = this;
  this.playing = true;
  this.lastTimestamp = (new Date()).getTime();
  this.requestid = requestAnimationFrame(function () {
    Recode.prototype.playrender.call(self);
  });
};

Recode.prototype.pause = function () {
  this.playing = false;
  cancelAnimationFrame(this.requestid);
  this.requestid = null;
};

Recode.adapters = {};
Recode.defaultOptions = {
  adapter: 'pre'
};
Recode.Helper = Helper;

Recode.TextareaAdapter = require('./textarea-adapter');
Recode.PreAdapter = require('./pre-adapter');
Recode.CodeMirrorAdapter = require('./codemirror-adapter');
Recode.AceAdapter = require('./ace-adapter');

Recode.Recoder = require('./recoder');
