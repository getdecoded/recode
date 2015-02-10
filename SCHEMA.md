# Recode Schema

This file will represent the schema for the current version of Recode. Go back in history for information on older versions.

This currently takes the form of a json file:

``` json
{
  "schema": 0.0.1,
  "files": [
    {
      "path": "string",
      "name": "string"
    }
  ],
  "recorded": [
    {    
      "mode": Number,
      "data": Object,
      "position": {"row": Number, "col": Number},
      "length": {"row": Number, "col": Number},
      "distance": Number
    }
  ]
}
```

The top level of the JSON data can be used for any metadata, but reserved keywords haven't been firmly decided upon.

The `recorded` property is an array of actions to take on one or more text files, assuming they are starting at a given state. The `mode` property dictates the action that should be taken. `data` is a property containing any useful data for that particular action (text to be inserted, files to be switched to). `position` is where in the text file that action should be taken, `length` is used as a relative coordinate for any length based actions (selections) and `distance` is the amount of milliseconds to wait from the previous action to perform this action.

### `mode == 0`

The text contained in `data` should be inserted at `postition`.

### `mode == 1`

The range of text covered by `position` and `length` is to be deleted.

### `mode == 2`

The range of text covered by `position` and `length` is to be selected. If length is 0 in magnitude, the caret is to be moved to `position`.

### `mode == 3`

The file is to be switched to the file indicated in `data` (where `file.path == recorded.data`).

## Todo

Give mode string names, and allow arbitrary assignment of numbers to represent these names. Do the same for property names but strings (for single letter properties).