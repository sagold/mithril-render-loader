# mithril-render-loader

> [webpack-Loader](https://webpack.js.org/) to render a [mithril](https://mithril.js.org/) [component](https://mithril.js.org/components.html) to html

**install** `npm install mithril-render-loader --save-dev`

**requirements** `node v6+`


## Options

| option            | type              | default   | description                                                   |
| ----------------- |:-----------------:| ----------|-------------------------------------------------------------- |
| model             | Mixed             | {}        | required data for component. Pass as vnode.attrs              |
| export            | Boolean           | false     | export using `module.exports` or return a string (html-loader)|
| cacheable         | Boolean           | true      | deactivate cache, forcing a complete rebuild each time        |
| profile           | Boolean           | false     | log render times to console                                   |
| escapeAttributes  | Function|Boolean  | false     | Escape HTML-Attributes. You may pass a function(value):value  |
| escapeString      | Function|Boolean  | false     | Escape HTML-TextNodes. You may pass a function(value):value   |
| strict            | Boolean           | false     | Render the html as xml/xhtml


## Usage Example

The `index.view.js`

```js
    const m = require("mithril");
    const View = {
        view(vnode) {
            const data = vnode.attrs.model;
            return m("Hello User");
        }
    }
```

The webpack-config might look something along theese lines:

```js
{

    entry: "./test/app/index.view.js",
    resolve: {
        modules: [".", "node_modules"]
    },
    output: {
        path: path.join(__dirname, "build")
    },
    module: {
        rules: [
            {
                test: [
                    path.join(__dirname, "test", "app", "index.view.js")
                ],
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "index.html"
                        }
                    },
                    {
                        loader: "extract-loader"
                    },
                    {
                        loader: "html-loader",
                        options: {
                            minimize: false, // deactivate minimize. It destroys valid inline css syntax
                            interpolate: false,
                            minifyCSS: false, // bugged
                            root: __dirname
                        }
                    },
                    {
                        loader: "mithril-render-loader",
                        options: {
                            model: {
                                title: "mithril-render-loader testpage",
                                items: [
                                    "compiles mithril component to html",
                                    "watches file changes"
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    }
};
```

If the _html-loader_ is omitted and mithril-render-loader should export a string, add the option `export: true`
