var Recoder = function() {
    this.recording = false;
    this.startTime = null;
    this.lastTime = null;
    this.files = [];
    this.actions = [];
};

Recoder.prototype.addAction = function(e) {
    var now = Date.now();
    var difference = now - this.lastTime;

    if (e.distance == null) {
        e.distance = difference;
        this.lastTime = now;
    }

    this.actions.push(e);
};

Recoder.prototype.start = function() {
    this.recording = true;
    this.startTime = this.lastTime = Date.now();
    this.files = [];
    this.actions = [];
};

Recoder.prototype.stop = function() {
    this.recording = false;

    var finaldata = { };
    var compressed = Recoder.compressData(this.actions);

    finaldata.files = this.files;
    finaldata.recorded = compressed.compressed;
    finaldata.varMap = compressed.keys;

    return finaldata;
};

Recoder.allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRS0123456789';

Recoder.compressData = function(data) {
    var compressedData = [];
    var keys = {};
    var reservedKeys = [];

    data.forEach(function(ob, i) {
        var newob = { };
        for (var prop in ob) {
            var value = ob[prop];
            if (typeof keys[prop] === 'undefined') {
                // Assign new key
                var key = prop.slice(0, 1);
                var keyIndex = 0;
                while(reservedKeys.indexOf(key) != -1) {
                    key = Recoder.allowedCharacters[keyIndex];
                    keyIndex ++;
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
