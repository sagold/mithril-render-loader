const m = require("mithril");


module.exports = {
    view(vnode) {
        vnode.attrs.STATE.items.push(this);
        console.log("ITEM", vnode.attrs.UID, vnode.attrs.STATE.items.length);
        const result = m("li", vnode.children);
        return result;
    }
};
