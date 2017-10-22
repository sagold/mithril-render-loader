# mithril-render-loader

> First shot at a [webpack-Loader](https://webpack.js.org/) to render a [mithril](https://mithril.js.org/) [component](https://mithril.js.org/components.html) to html

**install** `npm install mithril-render-loader`

**requirements** `node v6+`


## Usage

The webpack-config might look something along theese lines:

```js
{

    entry: [
        "./test/app/index.view.js"
    ],

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
                            root: __dirname,
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
