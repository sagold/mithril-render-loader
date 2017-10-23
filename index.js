/* eslint no-invalid-this: 0 */
require("mithril/test-utils/browserMock")(global);
const m = require("mithril");
const chalk = require("chalk");
const render = require("mithril-node-render");
const vm2 = require("vm2");


const requireHook = `
    var path = require("path");
    var hook = require("require-hook");
    hook.attach(path.resolve());
`;

const requireExport = `
    require('exportRequires')(hook.getData());
    hook.detach(path.resolve());
`;


function logTime(message, startTime, endTime) {
    console.log(`${chalk.cyan("mithril-render-loader")} -- ${message}: ${chalk.blue((endTime - startTime) / 1000)}s`);
}


function mithrilRenderLoader(view) {
    const timeStart = Date.now();

    // options
    const o = Object.assign({
        profile: false, // log build times
        model: null, // data passed to component
        "export": false,  // use module.exports or return result as string (html-loader)
        // vm
        whitelist: ["fs", "path", "module"], // whitelist native modules, "*" is also possible
        sandbox: {} // environment variables and helpers within nodejs-context of component
    }, this.query);

    // the render-mithril operation is async
    var done = this.async();

    // put required dependencies here
    let dependencies;


    // configure the vm which will run the given contents
    const vm = new vm2.NodeVM({
        console: "inherit",
        sandbox: Object.assign({}, o.sandbox),
        require: {
            external: true,
            builtin: o.whitelist,
            root: "./",
            mock: {
                exportRequires(list) {
                    dependencies = list
                        .map((info) => info.absPath)
                        .filter((path) => typeof path === "string");
                }
            }
        }
    });

    const timeStartRun = Date.now();
    o.profile && logTime("initializing vm", timeStart, timeStartRun);


    // run the contents in nodejs, hooking into require
    try {
        view = vm.run(`${requireHook}${view}${requireExport}`, this.resource);
    } catch (e) {
        done(e);
        return;
    }

    const startRendering = Date.now();
    o.profile && logTime(`executing ${this.resource}`, timeStartRun, startRendering);


    dependencies.forEach((filepath) => {
        // watch file dependencies
        this.addDependency(filepath);
        // and remove them from cache in order to be reread next run (webpack-dev-server)
        delete require.cache[filepath];
    });

    // fetch the required data and render the component
    render(m(view, o.model)).then((html) => {
        const timeEnd = Date.now();
        o.profile && logTime("rendering component", startRendering, timeEnd);
        o.profile && logTime(`total time ${this.resource}`, timeStart, timeEnd);

        if (o.export) {
            // if no html loader
            return done(null, `module.exports = ${JSON.stringify(html)}`);
        }

        return done(null, html);
    })
    .catch(done);
}


module.exports = mithrilRenderLoader;
