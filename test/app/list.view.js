const m = require("mithril");
const Item = require("./item.view");


module.exports = {
    view(vnode) {
        console.log("LIST", vnode.attrs.UID);

        const result = m("ul.testpage-list",
            {
                oninit(vul) {
                    // console.log("VIRUTAL", vul.dom.classList);
                },
                style: "padding: 24px; border-top: 2px solid #80D8FF"
            },
            vnode.attrs.items.map((message) => m(Item, { STATE: vnode.attrs.STATE, UID: vnode.attrs.UID }, message))
        );

        console.log("FROM LIST", vnode.attrs.STATE.items.length);
    }
};
