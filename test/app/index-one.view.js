const m = require("mithril");
const ListComponent = require("./list.view");

module.exports = {

    view(vnode) {
        console.log("Render", vnode.attrs.UID);

        const STATE = {
            UID: vnode.attrs.UID,
            items: []
        };

        const result = m("html",
            m("head",
                m("title", vnode.attrs.title),
                m("style", m.trust(`
                    * {
                        font-family: "Helvetica Neue", Helvetica, sans;
                    }
                `))
            ),
            m("body",
                m("h1", { style: "color: #2196F3; padding: 24px 0; margin: 0;" }, vnode.attrs.title),
                m(ListComponent, {
                    STATE,
                    UID: vnode.attrs.UID,
                    items: vnode.attrs.items
                })
            )
        );

        console.log("vnode.attrs.UID", STATE.items.length);
        return result;
    }
};
