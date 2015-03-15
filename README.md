# Recode

Pronounced like *record* but with code, instead.

Video tutorials are fantastic for getting information across quickly, but when pertaining to code, they always seem old fashioned. This is because seeing code appear in a compressed, lossy video doesn't look as crisp as it can, and it isn't interactive (no copy + paste!). Here's the solution: hit record in your text editor, record your video/audio, and then play them back in tandem.

## Basic Usage

First, aquire a recorddata.json file that follows the schema.

Add the `recode.js` and `recode.css` files to your HTML somewhere. The `recode.css` is very basic and you only need it if you are using the `pre` or `textarea` adapters.

Choose the adapter you want to use. Building your own is possible, but docs for that are still to come (you can check the source if you're impatient):

- `textarea` displays a regular textarea. Due to how selections and carets work in disabled textareas, this is a bit buggy
- `pre` uses a pre element and works better than a textarea. This is usually the one you should use for the most basic functionality. No syntax highlighting
- `codemirror` creates a codemirror instance and runs from that. This is good because it supports syntax highlighting and will allow for multiple selections once the schema supports it
- `ace` coming soon

Create an element to contain your Recode instance

    <div id="recode"></div>

Run your Recode instance

    <script>
      var recode = new Recode({
        element: document.getElementById('recode'),
        recorddata: recorddata
      });
      recode.play();
    </script>

Where `recorddata` is the recorded data as a Javascript object (so parse the JSON before you pass it to the function).

Watch the code fly!

## Schema

See [SCHEMA.md](SCHEMA.md).

## Editor Bindings

- [Brackets](http://github.com/decode-org/recode-brackets)

## License

MIT
