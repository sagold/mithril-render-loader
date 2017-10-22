const path = require("path");
const USE_SOURCEMAPS = true;


const webpackConfig = {

    target: "web",
    devtool: USE_SOURCEMAPS ? "source-map" : false,

    entry: [
        "./test/app/index.view.js"
    ],

    resolve: {
        modules: [".", "node_modules"],
        extensions: [".js", ".hbs"],
        alias: {}
    },

    output: {
        path: path.join(__dirname, "build"),
        filename: "[name]-[chunkhash].js",
        chunkFilename: "[id].js",
        pathinfo: USE_SOURCEMAPS,
        hashFunction: "sha256",
        hashDigestLength: 16
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
                        loader: "html-loader"
                    },
                    {
                        loader: path.join(__dirname, "index.js"),
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


module.exports = webpackConfig;
