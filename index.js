/* eslint no-invalid-this: 0 */
require("mithril/test-utils/browserMock")(global);
const m = require("mithril");
const chalk = require("chalk");
const render = require("mithril-node-render");


function logTime(message, startTime, endTime) {
    console.log(`${chalk.cyan("mithril-render-loader")} -- ${message}: ${chalk.blue((endTime - startTime) / 1000)}s`);
}


function mithrilRenderLoader(view) {
    const timeStart = Date.now();
    // the render-mithril operation is async
    var done = this.async();
    // options
    const o = Object.assign({
        profile: false, // log build times
        model: null, // data passed to component
        "export": false // use module.exports or return result as string (html-loader)
    }, this.query);

    // prototype - webpack require
    const requests = [];
    const self = this;
    function resolveModule(id, requestPath) {
        return new Promise((resolve, reject) => {
            // console.log(`mithril require ${requestPath}`);
            self.loadModule(requestPath, (err, source, sourceMap, module) => {
                if (err) {
                    return reject(err);
                }
                // module.exports = __webpack_public_path__ + "intro-mobile-f825065fb480b357.jpg";
                source = source.replace(/^module.exports[^"]*/, "").replace(/(^"|";$)/g, "");
                return resolve({ id, source });
            });
        });
    }

    global.resolve = function (requestPath) {
        const id = `{{${requestPath}${Date.now()}${Math.random()}`;
        requests.push(resolveModule(id, requestPath));
        return id;
    };


    const dependenciesBefore = Object.keys(require.cache);
    view = require(this.resourcePath);
    let timeResolve;

    // fetch the required data and render the component
    render(m(view, o.model))
        .then((html) => {
            timeResolve = Date.now();
            o.profile && logTime(`render component ${this.resource}`, timeStart, timeResolve);
            global.resolve = undefined;

            const dependencies = [];
            Object.keys(require.cache).forEach((filepath) => {
                if (dependenciesBefore.indexOf(filepath) === -1) {
                    dependencies.push(filepath);
                }
            });

            // clear cache AFTER main file has been compiled
            dependencies.forEach((filepath) => {
                // watch file dependencies
                this.addDependency(filepath);
                // and remove them from cache in order to be reread next run (webpack-dev-server)
                delete require.cache[filepath];
            });

            // tryout
            this.addDependency(this.resourcePath);

            return html;
        })
        .then((html) => Promise
            .all(requests)
            .then((results) => {
                o.profile && logTime(`resolve webpack requires ${this.resource}`, timeResolve, Date.now());

                results.forEach((data) => {
                    html = html.replace(data.id, data.source);
                });
                return html;
            })
        )
        .then((html) => {
            o.profile && logTime(`total time ${this.resource}`, timeStart, Date.now());

            if (o.export) { // if no html loader
                return done(null, `module.exports = ${JSON.stringify(html)}`);
            }
            return done(null, html);
        })
        .catch(done);
}


module.exports = mithrilRenderLoader;
