!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Recode=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var Recode = _dereq_('./recode');
module.exports = Recode;



},{"./recode":6}],2:[function(_dereq_,module,exports){
var Recode = _dereq_('./recode');
var Helper = Recode.Helper;

var AceAdapter = function (recode) {
  this.recode = recode;
}

AceAdapter.prototype.changeText = function (text, position, length) {
  // Nothing to see here
};

AceAdapter.prototype.changeSelection = function (position, length) {
  // Nothing to see here
};

AceAdapter.prototype.changeFile = function (filepath, file) {
  // Change language
};

AceAdapter.prototype.render = function () {
  // Render it
};

/*AceAdapter.languageMappings = [
    {
        names: ['html', 'htm'],
        mode: 'htmlmixed'
    },
    {
        names: ['js'],
        mode: 'javascript'
    }
];*/

Recode.adapters.ace = AceAdapter;
module.exports = AceAdapter;

},{"./recode":6}],3:[function(_dereq_,module,exports){
var Recode = _dereq_('./recode');
var Helper = Recode.Helper;

// Check if CodeMirror is available as a module or as a global

var canCodeMirror = false;

try {
  var CodeMirror = _dereq_('codemirror');
  canCodeMirror = true;
} catch (e) {
  // No codemirror, that's okay
  if ((typeof window != 'undefined') && (window.CodeMirror)) {
    var CodeMirror = window.CodeMirror;
    canCodeMirror = true;
  } else {
    var CodeMirrorAdapter = function (recode, options) {
      throw new Error('CodeMirror must be available to use CodeMirror adapter');
    };
  }
}

if (canCodeMirror) {
  var CodeMirrorAdapter = function (recode, options) {
    this.recode = recode;

    this.languageMap = Helper.simplifyLanguageMappings(CodeMirrorAdapter.languageMappings);
    this.codemirror = options.codemirror || CodeMirror(this.recode.element);
    this.document = this.codemirror.getDoc();
    this.mode = '';
    this.lastVal = '';
    console.log(recode.files[0]);
    this.document.setValue(recode.files[0].currentContent);
  };

  CodeMirrorAdapter.prototype.changeText = function (text, position, length) {
    // Nothing to see here
  };

  CodeMirrorAdapter.prototype.changeSelection = function (position, length) {
    // Nothing to see here
  };

  CodeMirrorAdapter.prototype.changeFile = function (filepath, file) {
    var mode = file.language || ((typeof filepath === 'string') ? filepath.substring(filepath.lastIndexOf(".") + 1) : '');

    if (mode != '') {
      this.mode = this.languageMap[mode] || mode;
      this.codemirror.setOption('mode', this.mode);
    }
  };

  CodeMirrorAdapter.prototype.render = function () {
    var file = this.recode.currentFile;

    if (this.lastVal != file.currentContent) {
      this.document.setValue(file.currentContent);
      this.lastVal = file.currentContent;
    }

    var pos = file.selections[0].position,
      len = file.selections[0].length,
      reversed = (len.row < 0 || (len.row == 0 && len.col < 0));

    var anchor = {
      line: pos.row,
      ch: pos.col
    };
    var head = {
      line: pos.row + len.row,
      ch: pos.col + len.col
    };

    if ((len.row == 0) && (len.col == 0)) {
      this.document.setCursor(anchor);
    } else {
      this.document.setSelection(anchor, head);
    }
  };

  CodeMirrorAdapter.languageMappings = [
    {
      names: ['html', 'htm'],
      mode: 'htmlmixed'
      },
    {
      names: ['js'],
      mode: 'javascript'
      }
  ];
}

Recode.adapters.codemirror = CodeMirrorAdapter;
module.exports = CodeMirrorAdapter;

},{"./recode":6,"codemirror":"codemirror"}],4:[function(_dereq_,module,exports){
var Helper = {};

// Thanks kennebec
// http://stackoverflow.com/a/14482123/1136593
Helper.nthIndex = function (str, pat, n) {
  var L = str.length,
    i = -1;
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i);
  }
  return i;
};

// Returns the
Helper.nthIndexRegex = function (str, pat, n) {
  var L = str.length,
    i = -1,
    match;
  while (((match = pat.exec(str)) != null) && (n--)) {
    i = match.index;
  }
  return i;
};

Helper.coordsToIndex = function (text, row, col) {
  var firstIndex = Helper.nthIndex(text, '\n', row);
  var secondIndex = Helper.nthIndex(text, '\n', row + 1);
  var lineLength = (secondIndex >= 0 ? secondIndex : text.length) - (firstIndex >= 0 ? firstIndex : 0);
  return (firstIndex >= 0 ? firstIndex + 1 : 0) + Math.min(col, lineLength);
};

Helper.insertString = function (text, sub, position) {
  return [text.slice(0, position), sub, text.slice(position)].join('');
};

Helper.removeString = function (text, pos1, pos2) {
  return text.slice(0, pos1) + text.slice(pos2);
};

// Thanks Kip
// http://stackoverflow.com/a/4835406/1136593
Helper.escapeHtml = function (text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

// Thanks CMS
// http://stackoverflow.com/a/499158/1136593
Helper.setSelectionRange = function (input, selectionStart, selectionEnd) {
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
Helper.extend = function () {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key)) {
        arguments[0][key] = arguments[i][key];
      }
    }
  }
  return arguments[0];
};

Helper.simplifyLanguageMappings = function (map) {
  var newmap = {};
  map.forEach(function (ob) {
    ob.names.forEach(function (name) {
      newmap[name] = ob.mode;
    });
  });
  return newmap;
};

module.exports = Helper;

},{}],5:[function(_dereq_,module,exports){
var Recode = _dereq_('./recode');
var Helper = Recode.Helper;

var PreAdapter = function (recode) {
  this.recode = recode;

  this.element = document.createElement('pre');
  this.element.className = 'recode-text';
  this.element.innerHTML = recode.files[0].currentContent;
  this.recode.element.appendChild(this.element);
}

PreAdapter.prototype.changeText = function (text, position, length) {
  // Nothing to see here
};

PreAdapter.prototype.changeSelection = function (position, length) {
  // Nothing to see here
};

PreAdapter.prototype.changeFile = function (filepath, file) {
  // Nothing to see here
};

PreAdapter.prototype.render = function () {
  var file = this.recode.currentFile;

  var first = Helper.coordsToIndex(file.currentContent, file.selections[0].position.row, file.selections[0].position.col),
    second = Helper.coordsToIndex(file.currentContent, file.selections[0].position.row + file.selections[0].length.row, file.selections[0].position.col + file.selections[0].length.col),
    beginning, end;

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

  this.element.innerHTML = Helper.escapeHtml(file.currentContent.slice(0, beginning)) + elemOpen + Helper.escapeHtml(file.currentContent.slice(beginning, end)) + '</span>' + Helper.escapeHtml(file.currentContent.slice(end));
};

Recode.adapters.pre = PreAdapter;
module.exports = PreAdapter;

},{"./recode":6}],6:[function(_dereq_,module,exports){
var Helper = _dereq_('./helper');

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


/**
 * The Recode object is responsible for playback of recordings but not for rendering
 *
 * @param {Object} options - options hash. Must contain "element" and "recorddata"
 *
 * @constructor Recode
 */
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

    fileobj.initialContent = content.replace(newline, '\n');
    fileobj.currentContent = fileobj.initialContent;
    fileobj.language = obj.language;

    self.files.push(fileobj);
  });

  [].slice.call(this.element.querySelectorAll('pre,p')).forEach(function (element) {
    if (element.parentNode === this.element) {
      this.element.removeChild(element);
    }
  }.bind(this));

  this.currentFile = this.files[0];
  this.adapter = new Recode.adapters[this.options.adapter](this, this.options.adapterOptions || { });
};

/**
 * Sets the current time
 *
 * @param {Number} time - The time in seconds
 */
Recode.prototype.setTime = function (time) {
  // this.lastActionTime = this.currentTime;
  this.currentTime = time;

  this.render();
};

/**
 * @private
 */
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

/**
 * Determine what state the files should be in, and pass to adapters for rendering
 */
Recode.prototype.render = function () {
  var self = this;
  var updated = false;

  // Start again if we're going backwards
  // TODO: Make this code smarter
  if (this.currentTime < this.lastActionTime) {
    updated = true;
    this.lastActionTime = 0;
    this.currentIndex = -1;
    this.files.forEach(function(file) {
      file.currentContent = file.initialContent;
    });
  }

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

/**
 * Start playback
 */
Recode.prototype.play = function () {
  var self = this;
  this.playing = true;
  this.lastTimestamp = (new Date()).getTime();
  this.requestid = requestAnimationFrame(function () {
    Recode.prototype.playrender.call(self);
  });
};

/**
 * Pause playback at current time
 */
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

Recode.TextareaAdapter = _dereq_('./textarea-adapter');
Recode.PreAdapter = _dereq_('./pre-adapter');
Recode.CodeMirrorAdapter = _dereq_('./codemirror-adapter');
Recode.AceAdapter = _dereq_('./ace-adapter');

Recode.Recoder = _dereq_('./recoder');

},{"./ace-adapter":2,"./codemirror-adapter":3,"./helper":4,"./pre-adapter":5,"./recoder":7,"./textarea-adapter":8}],7:[function(_dereq_,module,exports){
/**
 * Very light object for recording typing of code and giving a Recode compatible schema
 *
 * @constructor Recoder
 */
var Recoder = function () {
  this.recording = false;
  this.startTime = null;
  this.lastTime = null;
  this.files = [];
  this.actions = [];
};

/**
 * Adds a code action to the list. See schema file for examples of this
 * Time between this and previous action will be calculated automatically
 * But can be overriden by setting the distance property of the action
 *
 * @param {Object} e - Object to define action
 */
Recoder.prototype.addAction = function (e) {
  var now = Date.now();
  var difference = now - this.lastTime;

  if (e.distance == null) {
    e.distance = difference;
    this.lastTime = now;
  }

  this.actions.push(e);
};

/**
 * Start recording. Must be called before addAction
 */
Recoder.prototype.start = function () {
  this.recording = true;
  this.startTime = this.lastTime = Date.now();
  this.files = [];
  this.actions = [];
};

/**
 * Stop recording and create a compressed recordData object
 *
 * @return {Object}
 */
Recoder.prototype.stop = function () {
  this.recording = false;

  var finaldata = {};
  var compressed = Recoder.compressData(this.actions);

  finaldata.files = this.files;
  finaldata.recorded = compressed.compressed;
  finaldata.varMap = compressed.keys;

  return finaldata;
};

Recoder.allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRS0123456789';

/**
 * Given a Recode compatible object, compress it down by converting string names into
 * single letter keys
 *
 * @memberof Recoder
 */
Recoder.compressData = function (data) {
  var compressedData = [];
  var keys = {};
  var reservedKeys = [];

  data.forEach(function (ob, i) {
    var newob = {};
    for (var prop in ob) {
      var value = ob[prop];
      if (typeof keys[prop] === 'undefined') {
        // Assign new key
        var key = prop.slice(0, 1);
        var keyIndex = 0;
        while (reservedKeys.indexOf(key) != -1) {
          key = Recoder.allowedCharacters[keyIndex];
          keyIndex++;
        }

        keys[prop] = key;
        reservedKeys.push(key);
      }

      newob[keys[prop]] = value;
    }
    compressedData.push(newob);
  });

  return {
    compressed: compressedData,
    keys: keys
  };
};

module.exports = Recoder;

},{}],8:[function(_dereq_,module,exports){
var Recode = _dereq_('./recode');
var Helper = Recode.Helper;

var TextareaAdapter = function (recode) {
  this.recode = recode;

  this.element = document.createElement('textarea');
  this.element.setAttribute('disabled', true);
  this.element.innerHTML = recode.files[0].currentContent;
  this.recode.element.appendChild(this.element);
}

TextareaAdapter.prototype.changeText = function (text, position, length) {
  // Nothing to see here
};

TextareaAdapter.prototype.changeSelection = function (position, length) {
  // Nothing to see here
};

TextareaAdapter.prototype.changeFile = function (filepath, file) {
  // Nothing to see here
};

TextareaAdapter.prototype.render = function () {
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

},{"./recode":6}]},{},[1])(1)
});