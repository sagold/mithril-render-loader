/* eslint no-invalid-this: 0 */
require("mithril/test-utils/browserMock")(global);
const m = require("mithril");
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


function mithrilRenderLoader(view) {
    // the render-mithril operation is async, which is a good thing most of the times
    var done = this.async();

    // require dependencies
    let dependencies;

    const vm = new vm2.NodeVM({
        console: "inherit",
        sandbox: {
        },
        require: {
            external: true,
            builtin: ["fs", "path", "module"],
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

    // run the contents in nodejs, hooking into require
    view = vm.run(`${requireHook}${view}${requireExport}`, this.resource);

    dependencies.forEach((filepath) => {
        // watch file dependencies
        this.addDependency(filepath);
        // and remove them from cache in order to be reread next run (webpack-dev-server)
        delete require.cache[filepath];
    });

    // fetch the required data
    const model = this.query.model;
    // and render the component
    render(m(view, model)).then((html) => {
        console.log("RESULT", html);
        done(null, `module.exports = ${JSON.stringify(html)}`);
    });
}


module.exports = mithrilRenderLoader;
