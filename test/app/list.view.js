const m = require("mithril");


module.exports = {
    view(vnode) {
        return m("ul.testpage-list",
            {
                oninit(vul) {
                    // console.log("VIRUTAL", vul.dom.classList);
                },
                style: "padding: 24px; border-top: 2px solid #80D8FF"
            },
            vnode.attrs.items.map((message) => m("li", message))
        );
    }
};
