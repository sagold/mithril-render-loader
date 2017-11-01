/* eslint no-invalid-this: 0 */
require("mithril/test-utils/browserMock")(global);
const m = require("mithril");
const chalk = require("chalk");
const render = require("mithril-node-render");


function logTime(message, startTime, endTime) {
    console.log(`${chalk.cyan("mithril-render-loader")} -- ${message}: ${chalk.blue((endTime - startTime) / 1000)}s`);
}


function mithrilRenderLoader(view) {
    // prevents some(!) messed up states - the loader is currently fast enough enough

    const timeStart = Date.now();
    // the render-mithril operation is async
    var done = this.async();
    // options
    const o = Object.assign({
        profile: false, // log build times
        model: null, // data passed to component
        "export": false, // use module.exports or return result as string (html-loader)
        cacheable: true, // deactivate cache, forcing a rebuild each time
        // mithril-render-node options @see https://github.com/MithrilJS/mithril-node-render#options
        escapeAttributes: false, // either a boolean or a function (value) => value to parse attributes
        escapeString: true, // A filter function for string nodes
        strict: false // true for xml/xhtml
    }, this.query);

    if (o.model === null) {
        this.emitWarning("property 'model' is not for mithril-render");
        o.model = {};
    }

    if (o.cacheable === false) {
        this.cacheable(false);
    }

    // pass a uid to mithril component
    o.model.ID = `${this.resourcePath}${Date.now()}${Math.random()}`;
    o.model.COMPONENT_ID = this.resourcePath;

    // prototype - webpack require
    const requests = [];
    const self = this;
    function resolveModule(id, requestPath) {
        return new Promise((resolve, reject) => {
            // console.log(`mithril require ${requestPath}`);
            self.loadModule(requestPath, (err, source, sourceMap, module) => {
                if (err) {
                    console.log("ERROR", err.message);
                    return reject(err);
                }
                // module.exports = __webpack_public_path__ + "intro-mobile-f825065fb480b357.jpg";
                source = source.replace(/^module\.exports[^"]*/, "");
                if (/^".*"$/.test(source)) {
                    source.replace(/(^"|"$)/g, "");
                }
                console.log("RESOLVED", source);
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


    // gather renderer options
    const renderOptions = { strict: o.strict };
    if (o.escapeAttributes === false) {
        renderOptions.escapeAttributeValue = (value) => value;
    } else if (typeof o.escapeAttributes === "function") {
        renderOptions.escapeAttributeValue = o.escapeAttributes;
    }
    if (o.escapeString === false) {
        renderOptions.escapeString = (value) => value;
    } else if (typeof o.escapeString === "function") {
        renderOptions.escapeString = o.escapeString;
    }

    // fetch the required data and render the component
    render(m(view, o.model), renderOptions)
        .then((html) => {
            timeResolve = Date.now();
            o.profile && logTime(`render component ${this.resource}`, timeStart, timeResolve);
            // global.resolve = undefined;

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

                    console.log("insert", data.source);

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
