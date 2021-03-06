# Recode Schema

This file will represent the schema for the current version of Recode. Go back in history for information on older versions.

This currently takes the form of a json file:

``` json
{
  "schema": "0.0.1",
  "files": [
    {
      "name": "String",
      "path": "String",
      "content": "String"
    }
  ],
  "recorded": [
    {    
      "mode": "Number",
      "data": "Object",
      "position": {"row": "Number", "col": "Number"},
      "length": {"row": "Number", "col": "Number"},
      "distance": "Number"
    }
  ],
  "varMap": {
    "key": "String"
  }
}
```

The top level of the JSON data can be used for any metadata, but reserved keywords haven't been firmly decided upon.

## `files`

This array of files represents any documents that may be edited during a Recode session. `name` must have a value, but `path` and `content` are optional. If `path` has a value, it represents the location of a file that contains the initial contents of that file, relative to this recorded data file, or in some other data-storage scheme (e.g. a DOM node with the same `data-filepath` attribtue. `content` allows the initial contents of the file to be stored in a string right then and there. If neither values are present, it is assumed that the file/document is initially empty.

## `recorded`

The `recorded` property is an array of actions to take on one or more text files, assuming they are starting at a given state. The `mode` property dictates the action that should be taken. `data` is a property containing any useful data for that particular action (text to be inserted, files to be switched to). `position` is where in the text file that action should be taken, `length` is used as a relative coordinate for any length based actions (selections) and `distance` is the amount of milliseconds to wait from the previous action to perform this action.

### `mode == 0`

The range of text covered by `position` and `length` is to be replaced by the text in `data`. 

### `mode == 1`

The range of text covered by `position` and `length` is to be selected. If length is 0 in magnitude, the caret is to be moved to `position`. `length` may represent an end of the selection that is before the beginning.

### `mode == 2`

The file is to be switched to the file indicated in `data` (where `file.path == recorded.data`).

### Minification

Every `key` stored in the `varMap` object maps to another key in a recorded action, with the value of this key being a new name to replace it with. This allows us to cut down on file size by mapping longer names to single letter strings.

### No newline horror

Text should be represented by either a single string representing a single line, or an array of strings representing lines one after the other. A particular playback mechanism may support newline characters, if it wants but there is no official support for this.

## Todo

Give mode string names, and allow arbitrary assignment of numbers to represent these names.
