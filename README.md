# mithril-render-loader

> First shot at a webpack loader for (simple) mithril views to be rendered as html

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
