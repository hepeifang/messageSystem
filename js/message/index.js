jBud.define("message/index", ["message/control", "message/data", "message/view"],
function(a) {
    var i, j, k, d = a("message/data"),
    e = a("message/view"),
    f = a("message/control"),
    g = function() {},
    h = {},
    l = new f.Message(d, new e);
    h = jBud.getConfigParameters(),
    i = h.callback,
    "string" == typeof i && (g = "function" == typeof window[i] ? window[i] : g),
    j = h.init,
    k = h.needShow,
    j = "false" == j ? !1 : "true" == j ? !0 : !0,
    k = "false" == k ? !1 : "true" == k ? !0 : !0,
    j && (l.setState("needShow", k), l.init()),
    g({
        close: function() {
            var a = l.getState("OFFLINE");
            "undefined" == typeof a || a || l.inactive()
        },
        open: function() {
            l.init();
            var a = l.getState("OFFLINE");
            "undefined" == typeof a || a || l.active()
        },
        reload: function() {
            l.reload()
        },
        isOnline: function() {
            return ! l.getState("OFFLINE")
        },
        addStateListener: function(a) {
            l.addEventListener("state", a)
        },
        removeStateListener: function(a) {
            l.removeEventListener("state", a)
        }
    })
});