jBud.define("message/control",
function(a, b, c) {
    var d = function(a, b) {
        this.Data = a,
        this.View = b,
        this.Memory = new e,
        this.baseId = this.View.getBaseId(),
        this.state = {}
    };
    jBud.enableListener(d.prototype),
    jBud.extend(d.prototype, {
        init: function(a) {
            var b = this.Data,
            c = this.View,
            d = this.Memory,
            e = this;
            this.init.invoked || (this.init.invoked = !0, d.property("TITLE", document.title), this.setState("OFFLINE", !0), c.renderSkinBase(b.getStyleBase(),
            function() {
                c.renderSkin(b.getSkinDefault(), b.getSkinPath()),
                e.build(a)
            }))
        },
        build: function(a) {
            var f, c = (this.Data, this.View);
            this.Memory,
            f = c.get("message"),
            f.length > 0 || (this.setState("OFFLINE", !0), c.node("body").append(c.renderFramework()), f = c.reload("message"), this.login(a), this.installUnload(), this.installFocus(), this.installClose(), this.installTray(), this.installSkin(), this.installFunc(), this.installPanelList(), this.installOffline())
        },
        login: function() {
            var b = this.Memory,
            c = this.Data,
            d = this;
            c.queryIsLogin(function(a, e) {
                a ? (b.setUser(e.content), c.queryLogin({
                    userId: b.getUser().userid
                },
                function(a) {
                    a ? (d.setState("OFFLINE", !1), d.loadSkin(), d.getState("needShow") && d.active(), d.emit("state", {
                        code: 200,
                        user: b.getUser()
                    })) : (d.setState("OFFLINE", !0), d.inactive(), d.emit("state", {
                        code: 400,
                        user: b.getUser()
                    }))
                }), d.loadSkinList(), d.load()) : (b.clearUser(), d.inactive())
            })
        },
        loadSkin: function() {
            var d, a = this.Data,
            b = this.Memory,
            c = this.View;
            d = b.getUser(),
            a.querySkin({
                userId: d.userid
            },
            function(d, e) {
                var f = b.getSkin();
                if (d && e.content) {
                    var g = e.content.skinValue;
                    g ? b.setSkin(g) : b.setSkin(a.getSkinDefault())
                } else f || b.setSkin(a.getSkinDefault());
                c.renderSkin(b.getSkin(), a.getSkinPath())
            })
        },
        loadSkinList: function() {
            var c, a = this.Data,
            b = this.View;
            c = b.get("traySkinList"),
            a.querySkinList(function(a) {
                c.html(b.renderSkinList(a))
            })
        },
        installUnload: function() {
            var a = this.View,
            b = this.Data;
            this.installUnload.once = !0,
            this.installUnload.invoked || (this.installUnload.invoked = !0, a.node(window).on("unload",
            function() {
                b.disconnect()
            }))
        },
        installFocus: function() {
            var b = (this.View, this);
            this.installFocus.once = !0,
            this.installFocus.invoked || (this.installFocus.invoked = !0, jBud(window).on("focus",
            function() {
                b.loadSkin()
            }))
        },
        installClose: function() {
            var a = this.View,
            b = a.get("panelTitle"),
            c = this;
            this.installClose.invoked || (this.installClose.invoked = !0, b.on("click", "._MBTN-WCLOSE_",
            function() {
                c.inactive(!0)
            }), b.on("click",
            function() {
                c.inactive(!0)
            }))
        },
        installTray: function() {
            var f, a = this.View,
            b = a.get("trayMessage"),
            c = a.get("trayTip"),
            d = this;
            if (!this.installTray.invoked) {
                this.installTray.invoked = !0,
                b.on("click",
                function() {
                    var a = d.getState("ACTIVED"),
                    b = d.showFlashTip.timer;
                    a ? b || d.inactive() : d.active()
                });
                var g = function() {
                    var a = d.getState("OFFLINE");
                    a && d.reload()
                };
                b.once("click",
                function() {
                    f || (f = setTimeout(function() {
                        g(),
                        clearTimeout(f),
                        delete f
                    },
                    500))
                }),
                c.on("click",
                function(b) {
                    var c = a.get("panelFunc"),
                    e = c.children("li"),
                    f = d.getState("ACTIVED");
                    f || d.active(),
                    jBud(e[0]).emit("click"),
                    b.stopPropagation()
                })
            }
        },
        installSkin: function() {
            var c, d, e, a = this.View,
            b = this;
            this.installSkin.invoked || (this.installSkin.invoked = !0, c = a.get("traySkin"), d = a.get("traySkinList"), e = a.get("traySkinSelect"), c.on("click",
            function(a) {
                e.toggleClass("_MHIDDEN_"),
                a.stopPropagation()
            }), d.on("click", "._MT-SKIN-ITEM_",
            function(a) {
                var d, c = a.target;
                d = c.getAttribute("data-skin"),
                b.pushSkin(d)
            }))
        },
        pushSkin: function(a) {
            var f, b = this.View,
            c = this.Data,
            d = this.Memory;
            f = d.getUser(),
            c.pushSkin({
                userId: f.userid,
                skinValue: a
            },
            function(e) {
                e && (d.setSkin(a), b.renderSkin(d.getSkin(), c.getSkinPath()))
            })
        },
        installFunc: function() {
            var b, c, d, a = this.View;
            if (!this.installFunc.invoked) {
                this.installFunc.invoked = !0;
                var e = -255;
                b = a.get("panelFunc"),
                c = b.children("li"),
                d = a.get("panelList"),
                c.each(function(a) {
                    this.setAttribute("data-move", e * a)
                }),
                c.on("click",
                function() {
                    var e = a.parseFloat(this.getAttribute("data-move"));
                    d.action({
                        marginLeft: e
                    },
                    {
                        queue: !1
                    }),
                    c.removeClass("_SELECTED_"),
                    jBud(this).addClass("_SELECTED_")
                }),
                jBud(c[1]).emit("click")
            }
        },
        doLockScroll: function(a, b) {
            var c = 0,
            d = jBud(a);
            b || (b = window.event),
            b.wheelDelta ? c = b.wheelDelta / 120 : b.detail && (c = -b.detail / 3);
            var e = d.scrollTop();
            d.scrollTop(e - 30 * c)
        },
        installPanelList: function() {
            var a = this.View,
            b = a.get("panelList"),
            c = this;
            this.installPanelList.invoked || (this.installPanelList.invoked = !0, b.on("click", "._MPL-NAME_",
            function(a) {
                var d, e, b = a.target;
                b && (d = b.getAttribute("data-id"), e = b.getAttribute("data-type"), c.activeChat(d, e))
            }))
        },
        installOffline: function() {
            var a = this.Data,
            b = this.Memory,
            c = this;
            if (!this.installOffline.invoked) {
                this.installOffline.invoked = !0;
                var d = function() {
                    c.setState("OFFLINE", !0),
                    c.inactive(),
                    c.emit("state", {
                        code: 400,
                        user: b.getUser()
                    })
                };
                a.onOffline(function() {
                    a.queryIsLogin(function(a) {
                        b.getUser(),
                        a ? d() : d()
                    })
                })
            }
        },
        installTalkCreate: function() {
            var e, a = this.View,
            b = this.Memory,
            c = a.get("panelCreateTalk"),
            d = this;
            this.installTalkCreate.invoked || (this.installTalkCreate.invoked = !0, e = b.getUser(), c.on("click",
            function() {
                d.activeTalk(e.userid, 1)
            }))
        },
        reload: function() {
            var f, a = this.View,
            b = this.Data,
            c = this.Memory;
            this.setState("OFFLINE", !0),
            f = document.title,
            c.clearAll(),
            b.clear(),
            a.get("chat").remove(),
            a.get("talk").remove(),
            a.get("message").remove(),
            a.clear(),
            this.clearState(),
            this.removeEventListeners(function(a) {
                return "state" != a
            });
            for (var g in this) {
                var h = this[g];
                "function" != typeof h || h.once || (h.invoked = void 0, h.installed = void 0)
            }
            document.title = f,
            this.init()
        },
        load: function() {
            var e, a = this.View,
            b = this.Data,
            c = this.Memory,
            d = this;
            return c.isActive() ? (this.load.invoked || (this.load.invoked = !0, e = c.getUser(), this.addEventListener("loadFriendTalk",
            function() {
                this.getState("LOAD-FRIEND") && this.getState("LOAD-TALK") && (b.queryRecent({
                    userId: e.userid
                },
                function(f, g) {
                    if (f) {
                        var h = c.saveRecent(g.content);
                        a.get("panelRecent").append(a.renderRecentList(h.originalRecent)),
                        b.queryOfflineMessage({
                            userId: e.userid
                        },
                        function(b, e) {
                            if (b && e.content) {
                                var f = e.content.group;
                                for (var g in f) {
                                    var h = jBud("." + a.getBaseId() + g + "TALKTIP");
                                    h.removeClass("_MHIDDEN_");
                                    var i = c.getTalk(g);
                                    i && (i.offlineCount = f[g]),
                                    h.text(d.getMaxCount(f[g]))
                                }
                                var j = e.content.person;
                                for (var g in j) {
                                    var k = jBud("." + a.getBaseId() + g + "FRIENDTIP");
                                    k.removeClass("_MHIDDEN_");
                                    var l = c.getFriend(g);
                                    l && (l.offlineCount = j[g]),
                                    k.text(d.getMaxCount(j[g]))
                                }
                                d.installTalkCreate(),
                                d.installMessage(),
                                d.installSearch(),
                                d.emit("state", {
                                    code: 210,
                                    user: c.getUser()
                                })
                            }
                        })
                    }
                }), this.removeEventListener("loadFriendTalk", arguments.callee))
            }), b.queryFriend({
                userId: e.userid
            },
            function(b, e) {
                if (b) {
                    var f = c.saveRelationship(e.content),
                    g = a.get("panelFriend");
                    g.append(a.renderFriendTree(f.originalFriend)),
                    d.installFriend(),
                    d.setState("LOAD-FRIEND", !0),
                    d.emit("loadFriendTalk")
                } else d.setState("LOAD-FRIEND", !1)
            }), b.queryTalk({
                userId: e.userid
            },
            function(b, e) {
                if (b) {
                    var f = c.saveTalk(e.content),
                    g = a.get("panelTalk");
                    g.append(a.renderTalkList(f.originalTalk)),
                    d.setState("LOAD-TALK", !0),
                    d.emit("loadFriendTalk"),
                    d.installTalkUpdate()
                } else d.setState("LOAD-TALK", !1)
            })), void 0) : this.inactive()
        },
        getMaxCount: function(a) {
            return a > 99 && (a = 99),
            a
        },
        active: function() {
            var c, d, a = this.View,
            b = this;
            d = this.getState("OFFLINE"),
            d || (this.setState("ACTIVED", !0), a.get("trayState").removeClass(a.style("TRAY_OFFLINE")).addClass(a.style("TRAY_ONLINE")), a.get("panel").height("0px").show(), this.setProperties(), c = this._panelHeight(), a.get("panel").action({
                height: c
            },
            {
                complete: function() {
                    b.resizePanel(),
                    b.installResize()
                }
            }), this.emit("state", {
                code: 300,
                width: a.get("message").outerWidth(!0)
            }))
        },
        inactive: function(a) {
            var c, b = this.View;
            c = this.getState("OFFLINE"),
            c && b.get("trayState").removeClass(b.style("TRAY_ONLINE")).addClass(b.style("TRAY_OFFLINE")),
            this.setState("ACTIVED", !1),
            this.inactiveChat(),
            this.inactiveTalk(),
            a || this.showFlashTip(!1),
            b.get("panel").action({
                height: 0
            },
            {
                complete: function() {}
            }),
            this.emit("state", {
                code: 301,
                width: b.get("message").outerWidth(!0)
            })
        },
        activeChat: function(a, b) {
            var h, i, j, d = (this.Data, this.View),
            e = d.get("chat"),
            f = this.Memory,
            g = this;
            if (e.length <= 0 && (d.node("body").append(d.renderChatFramework()), e = d.reload("chat"), e.css({
                opacity: 0,
                right: "240px"
            })), this.installChat(), e.show(), e.action({
                opacity: 1,
                right: 260
            },
            {
                queue: !1
            }), h = d.get("chatTitle"), i = d.get("chatPanel"), 1 == b) {
                var l, m, n, o, k = f.getFriend(a);
                if (!k) return;
                n = "#" + d.getBaseId() + k.userId + "CHAT-FRIEND-TITLE",
                l = jBud(n),
                l.length <= 0 && (l = f.getTemp(n), l && l.length > 0 ? h.prepend(l) : (h.prepend(d.renderChatTitleFriend(k)), l = jBud(n))),
                o = "#" + d.getBaseId() + k.userId + "CHAT-FRIEND-PANEL",
                m = jBud(o),
                m.length <= 0 && (m = f.getTemp(o), m && m.length > 0 ? i.prepend(m) : (i.prepend(d.renderChatPanelFriend(k)), m = jBud(o))),
                j = l
            } else if (2 == b) {
                var q, r, s, t, p = f.getTalk(a);
                if (!p) return;
                s = "#" + d.getBaseId() + p.g_id + "CHAT-TALK-TITLE",
                q = jBud(s),
                q.length <= 0 && (q = f.getTemp(s), q && q.length > 0 ? h.prepend(q) : (h.prepend(d.renderChatTitleTalk(p)), q = jBud(s))),
                q.find("._MC-TAB-NAME_").text(p.title),
                t = "#" + d.getBaseId() + p.g_id + "CHAT-TALK-PANEL",
                r = jBud(t),
                r.length <= 0 && (r = f.getTemp(t), r && r.length > 0 ? (i.prepend(r), p.reload && (g.loadTalkMember(p.g_id), p.reload = !1)) : (i.prepend(d.renderChatPanelTalk(p)), g.loadTalkMember(p.g_id), r = jBud(t))),
                j = q
            }
            var u = 700 * i.children().length + "px";
            i.width(u),
            "undefined" != typeof a && "undefined" != typeof b && (j.find("._MC-TAB-NAME_").emit("click"), this.installChatImage(a, b), 1 == b && this.installChatAnnex(a, b), f.property({
                "CURRENT-CHAT": {
                    id: a,
                    type: b
                }
            }))
        },
        inactiveChat: function() {
            var b = (this.Data, this.View),
            c = b.get("chat");
            c.length <= 0 || c.action({
                opacity: 0,
                right: 240
            },
            {
                queue: !1,
                complete: function() {
                    c.hide()
                }
            })
        },
        installMessage: function() {
            var b = (this.View, this.Data),
            d = (this.Memory, this);
            b.onFriendMessage(function(a) {
                d.dispatch(a, 1)
            }),
            b.onTalkMessage(function(a) {
                d.dispatch(a, 2)
            })
        },
        installSearch: function() {
            var d, e, f, a = this.View,
            b = this.Memory,
            c = this;
            if (!this.installSearch.invoked) {
                this.installSearch.invoked = !0,
                d = a.get("panelSearch"),
                e = a.get("panelSearchResult"),
                f = a.get("panelTop");
                var g = function() {
                    return text = jBud.trim(d.val()),
                    text.length <= 0 ? (e.addClass("_MHIDDEN_"), void 0) : (results = b.matchIndexes(text), e.html(a.renderSearch(results)), e.removeClass("_MHIDDEN_"), void 0)
                };
                f.on("click", "._MP-SEARCH-BUTTON_",
                function() {
                    g()
                }),
                d.on("keydown",
                function(a) {
                    var b = a.which,
                    c = jBud(this);
                    switch (b) {
                    case 13:
                        g();
                        break;
                    case 27:
                        c.val(""),
                        g()
                    }
                }),
                d.on("keyup",
                function() {
                    var c, b = jBud(this);
                    return c = jBud.trim(b.val()),
                    c.length <= 0 ? (e.addClass("_MHIDDEN_"), void 0) : void 0
                }),
                e.on("click", "._MPL-NAME_",
                function(a) {
                    var d, f, b = a.target;
                    d = b.getAttribute("data-id"),
                    f = b.getAttribute("data-type"),
                    c.activeChat(d, f),
                    e.addClass("_MHIDDEN_")
                })
            }
        },
        dispatch: function(a, b) {
            var e, d = (this.Memory, this);
            a && (e = a.state, 1 == b ? 2 == e && d.chatFriendMessage(a) : 2 == b && (2 == e ? d.appendBubble(d.transferMessage(a, b)) : 3 == e ? d.createTalkMessage(a) : 4 == e ? d.joinTalkMessage(a) : 5 == e ? d.updateTalkMessage(a) : 6 == e && d.quitTalkMessage(a)))
        },
        transferMessage: function(a, b) {
            var d, c = this.Memory;
            if (!a) return void 0;
            if (1 == b) {
                var e = a.is_self ? a.f_id: a.t_id,
                f = a.is_self ? a.t_id: a.f_id,
                g = a.is_self ? "PULL": "PUSH";
                d = {
                    type: b,
                    id: e,
                    fromId: f,
                    toId: e,
                    context: a.context,
                    method: g,
                    time: a.time
                }
            } else if (2 == b) {
                var h = c.getUser(),
                g = h.userid == a.send_id ? "PUSH": "PULL";
                d = {
                    type: b,
                    id: a.g_id,
                    fromId: a.send_id,
                    toId: a.g_id,
                    context: a.context,
                    method: g,
                    time: a.time
                }
            }
            return d
        },
        chatFriendMessage: function(a) {
            var d;
            this.View,
            this.Memory,
            d = this.transferMessage(a, 1),
            this.guaranteeFriend(d),
            this.appendBubble(d),
            this.turnFriendLine(d.id, "PULL" == d.method)
        },
        guaranteeFriend: function(a) {
            var g, h, b = this.View,
            c = this.Memory,
            d = this.Data,
            e = this,
            f = b.getBaseId();
            a && 1 == a.type && (h = c.getFriend(a.id), h || (c.pushMessageCache(a), g = jBud("#" + f + "panelTreeNode" + "ROOT"), d.queryFriendInfo({
                userId: a.id
            },
            function(d, f) {
                if (d && f && f.content) {
                    jBud.extend(f.content, a);
                    var h = c.pickMessageCache(a.id);
                    f.content.online = !0,
                    f.content.message = h || [],
                    c.saveFriend(f.content);
                    var i = b.renderFriend(f.content, {
                        groupId: "ROOT"
                    });
                    g.next().prepend(i),
                    e.prependRecent(a.id, 1),
                    e.showUnknownMessage(a.id, 1)
                }
            })))
        },
        turnFriendLine: function(a, b) {
            var d, f, c = this.View;
            d = jBud("." + c.getBaseId() + a + "FRIEND-ICON"),
            friendItems = jBud("." + c.getBaseId() + a + "TREE-FRIEND"),
            f = this.getState("FRIEND-ONLINE"),
            b ? (d.removeClass("_OFFLINE_").addClass("_ONLINE_"), friendItems.removeClass("_MPL-OFFLINE_")) : (d.removeClass("_ONLINE_").addClass("_OFFLINE_"), friendItems.addClass("_MPL-OFFLINE_")),
            friendItems.each(function() {
                var a = jBud(this);
                a.hasClass("_MPL-OFFLINE_") ? f && a.hide() : a.show()
            })
        },
        loadTalkMember: function(a) {
            var b = this.Data,
            c = this.View,
            d = this.Memory,
            e = this;
            b.queryTalkMember({
                g_id: a
            },
            function(b, f) {
                if (b) {
                    jBud("#" + c.getBaseId() + a + "CHAT-TALK-MEMBER-LIST").html(c.renderChatPanelTalkMember(f.content));
                    var h, g = 0;
                    f && f.content && (h = f.content.g_members) && (g = h.length || 0),
                    jBud("#" + c.getBaseId() + a + "CHAT-TALK-MEMBER-COUNT").html(g),
                    d.saveTalkMembers(a, h),
                    e.activeDeferBubble(a)
                }
            })
        },
        createTalkMessage: function(a) {
            var d, e, g, b = this.View,
            c = this.Memory;
            a && (g = b.get("panelTalkList"), d = c.getTalkOrSave(a), e = c.getUser(), g.append(b.renderTalk(d)), this.prependRecent(a.g_id, 2), d.owner == e.userid && this.activeChat(a.g_id, 2))
        },
        joinTalkMessage: function(a) {
            var d, e, f, b = this.View,
            c = this.Memory;
            a && (f = c.existTalk(a.g_id), d = c.getTalkOrSave(a), f ? (e = jBud("#" + b.getBaseId() + a.g_id + "CHAT-TALK-MEMBER-LIST"), e.length > 0 ? this.loadTalkMember(a.g_id) : d.reload = !0) : ($panelTalkList = b.get("panelTalkList"), $panelTalkList.append(b.renderTalk(d)), this.prependRecent(a.g_id, 2)))
        },
        quitTalkMessage: function(a) {
            var e, f, g, h, i, j, b = this.View,
            c = this.Memory,
            d = b.getBaseId();
            a && (e = c.getUser(), e.userid == a.send_id ? (f = jBud("#" + d + a.g_id + "RECENT-TALK"), g = jBud("#" + d + a.g_id + "PANEL-TALK"), h = jBud("#" + d + a.g_id + "CHAT-TALK-TITLE"), f.remove(), g.remove(), h.find("._MC-TAB-CLOSE_").emit("click"), c.removeTalk(a.g_id), c.removeTemp("#" + d + a.g_id + "CHAT-TALK-TITLE")) : (j = jBud("#" + b.getBaseId() + a.send_id + "CHAT-TALK-MEMBER-ITEM"), i = jBud("#" + b.getBaseId() + a.g_id + "CHAT-TALK-MEMBER-LIST"), j.remove(), c.removeTalkMember(a.g_id, a.send_id), i.length > 0 ? this.loadTalkMember(a.g_id) : talk.reload = !0))
        },
        updateTalkMessage: function(a) {
            var e, f, g, b = this.View,
            c = this.Memory,
            d = b.getBaseId();
            a && (user = c.getUser(), e = jBud("." + d + a.g_id + "TALK-NAME").text(a.title), f = jBud("#" + d + a.g_id + "CHAT-TALK-TITLE"), f && f.find("._MC-TAB-NAME_").text(a.title), g = c.getTalk(a.g_id), g && (g.title = a.title))
        },
        installFriend: function() {
            var a = this.View,
            b = this,
            c = a.get("panelFriend"),
            d = a.get("panelFriendOnline");
            this.installFriend.invoked || (this.installFriend.invoked = !0, c.on("click", "._MPL-TREE-TITLE_",
            function(a) {
                var b = jBud(a.target);
                b.next().toggleClass("_MHIDDEN_"),
                b.toggleClass("_SELECTED_")
            }), a.get("panelTreeNode", "ROOT").emit("click"), d.on("click",
            function() {
                var f, d = jBud(this),
                e = d.prop("checked");
                f = c.find("._MPL-OFFLINE_"),
                e ? f.hide() : f.show(),
                b.setState("FRIEND-ONLINE", e)
            }))
        },
        installTalkUpdate: function() {
            var c, a = this.View,
            b = this;
            this.installTalkUpdate.invoked || (this.installTalkUpdate.invoked = !0, c = a.get("panelTalk"), c.on("click", "._MPL-EDIT_",
            function(a) {
                var c, d, e, f, g, h, b = a.target;
                c = b.getAttribute("data-id"),
                d = b.getAttribute("data-type"),
                e = jBud(b),
                f = e.parent(),
                g = f.children("._MPL-NAME-EDIT_"),
                h = f.children("._MPL-NAME_"),
                g.removeClass("_MHIDDEN_"),
                h.hide(),
                g.val(h.text()),
                b.parentNode.childNodes[2].focus()
            }), c.on("keydown", "._MPL-NAME-EDIT_",
            function(a) {
                var d, e, f, g, h, i, c = a.target;
                if (d = c.getAttribute("data-id"), e = c.getAttribute("data-type"), f = jBud(c), g = f.prev(), h = jBud.trim(g.text()), 27 == a.which) return f.addClass("_MHIDDEN_"),
                g.show(),
                void 0;
                if (13 == a.which) {
                    if (i = jBud.trim(f.val()), i.length <= 0 || i == h) return f.addClass("_MHIDDEN_"),
                    g.show(),
                    void 0;
                    if (i.length > 10) return alert("\u8ba8\u8bba\u7ec4\u540d\u79f0\u4e0d\u80fd\u8d85\u8fc710\u4e2a\u5b57\u7b26\uff01"),
                    void 0;
                    b.updateTalkTitle({
                        id: d,
                        title: i
                    },
                    function(a) {
                        a ? (f.addClass("_MHIDDEN_"), g.show()) : alert("\u4fee\u6539\u5931\u8d25\u3002")
                    })
                }
            }))
        },
        updateTalkTitle: function(a, b) {
            var f, c = this.Data,
            d = this.Memory,
            e = this;
            f = d.getUser(),
            c.pushTalkUpdate({
                g_id: a.id,
                title: a.title,
                send_id: f.userid
            },
            function(a) {
                a.flag && e.dispatch(a, 2),
                jBud.isFunction(b) && b(a.flag)
            })
        },
        installChat: function() {
            this.View,
            this.Memory,
            this.installChat.invoked || (this.installChat.invoked = !0, this._installChatClose(), this._installChatTabSwitch(), this._installChatTabClose(), this._installChatRecord(), this._installChatPost(), this._installChatTalk(), this._installChatTalkQuit(), this._installChatFaces(), this._installChatPreview())
        },
        _installChatClose: function() {
            var c, a = this.View,
            b = this;
            c = a.get("chat"),
            c.on("click", "._MBTN-WCLOSE_",
            function() {
                b.inactiveChat()
            }),
            c.on("click", "._MBTN-WNARROW_",
            function() {
                b.inactiveChat()
            })
        },
        _installChatTabSwitch: function() {
            var d, e, a = this.View,
            b = this.Memory,
            c = this,
            f = -700;
            d = a.get("chatTitle"),
            e = a.get("chatPanel"),
            d.on("click", "._MC-TAB-NAME_",
            function(a) {
                var h, i, j, k, l, m, n, g = a.target;
                h = g.getAttribute("data-id"),
                i = g.getAttribute("data-type");
                var o = c.getChatTitleAndPanel(h, i);
                if (j = o.title, k = o.panel, n = b.getObject(h, i), k && !((l = k.index()) < 0)) {
                    d.children("li").removeClass("_SELECTED_"),
                    j.addClass("_SELECTED_"),
                    c.clearOfflineMessage(h, i),
                    2 == i && c.activeDeferBubble(h),
                    b.property({
                        "CURRENT-CHAT": {
                            id: h,
                            type: i
                        }
                    });
                    var p = j.index(),
                    q = j.outerWidth(!0),
                    r = d.width(),
                    s = (p + 1) * q > r;
                    if (s) return d.prepend(j),
                    e.prepend(k),
                    e.css("marginLeft", "0px"),
                    c.appendHistoryBubble(h, i),
                    void 0;
                    m = l * f,
                    e.action({
                        marginLeft: m
                    },
                    {
                        queue: !1,
                        complete: function() {}
                    }),
                    c.appendHistoryBubble(h, i)
                }
            })
        },
        _installChatTabClose: function() {
            var d, e, a = this.View,
            b = this.Memory,
            c = this;
            d = a.get("chatTitle"),
            e = a.get("chatPanel"),
            d.on("click", "._MC-TAB-CLOSE_",
            function(d) {
                var f, g, h, i, j, k, l, m, e = d.target;
                f = e.getAttribute("data-id"),
                g = e.getAttribute("data-type");
                var n = c.getChatTitleAndPanel(f, g);
                h = n.title,
                i = n.panel,
                k = a.get("chatTitle"),
                h.hasClass("_SELECTED_") ? (j = h.next()).length > 0 || (j = h.prev()).length > 0 || void 0 : void 0,
                m = c.getProperty("CURRENT-CHAT"),
                !m || m.id == f && m.type == g || (1 == m.type ? j = jBud("#" + a.getBaseId() + m.id + "CHAT-FRIEND-TITLE") : 2 == m.type && (j = jBud("#" + a.getBaseId() + m.id + "CHAT-TALK-TITLE"))),
                h.remove(),
                i.remove(),
                b.pushTemp(n.titleSelector, h).pushTemp(n.panelSelector, i),
                1 == (l = k.children()).length && (j = jBud(l[0])),
                j && j.find("._MC-TAB-NAME_").emit("click"),
                l.length <= 0 && (c.inactiveChat(), c.removeProperty("CURRENT-CHAT"))
            })
        },
        _installChatRecord: function() {
            var d, a = this.View,
            c = (this.Memory, this);
            d = a.get("chatPanel"),
            d.on("click", "._MTOOLS-RECORD_",
            function(b) {
                var e, f, g, h, i, j, d = b.target;
                e = d.getAttribute("data-id"),
                f = d.getAttribute("data-type"),
                j = jBud(d),
                1 == f ? (g = jBud("#" + a.getBaseId() + e + "CHAT-FRIEND-MAIN"), h = jBud("#" + a.getBaseId() + e + "CHAT-FRIEND-RECORD"), i = jBud("#" + a.getBaseId() + e + "CHAT-FRIEND-MEMBER")) : 2 == f && (g = jBud("#" + a.getBaseId() + e + "CHAT-TALK-MAIN"), h = jBud("#" + a.getBaseId() + e + "CHAT-TALK-RECORD"), i = jBud("#" + a.getBaseId() + e + "CHAT-TALK-MEMBER")),
                1 == f && g.toggleClass("_MCP-SHOWINFO_"),
                i.toggleClass("_MHIDDEN_"),
                h.toggleClass("_MHIDDEN_"),
                j.next().addClass("_MHIDDEN_"),
                h.hasClass("_MHIDDEN_") || c.readHistoryMessage(e, f)
            });
            var e = function(b) {
                var d, e, f, g, h, c = b.target;
                if (c) return d = c.parentNode,
                e = d.getAttribute("data-id"),
                f = d.getAttribute("data-type"),
                1 == f ? (g = jBud("#" + a.getBaseId() + e + "CHAT-FRIEND-RECORD-TEXT"), h = jBud("#" + a.getBaseId() + e + "CHAT-FRIEND-RECORD-TOTAL")) : 2 == f && (g = jBud("#" + a.getBaseId() + e + "CHAT-TALK-RECORD-TEXT"), h = jBud("#" + a.getBaseId() + e + "CHAT-TALK-RECORD-TOTAL")),
                {
                    id: e,
                    type: f,
                    pageNum: a.parseFloat(g.val()),
                    min: 1,
                    max: a.parseFloat(h.text())
                }
            };
            d.on("click", "._MINFO-MSEARCH-LEFT_",
            function(a) {
                var d, b = e(a);
                d = b.pageNum - 1,
                d = d < b.min ? b.min: d,
                c.readHistoryMessage(b.id, b.type, d)
            }),
            d.on("click", "._MINFO-MSEARCH-RIGHT_",
            function(a) {
                var d, b = e(a);
                d = b.pageNum + 1,
                d = d > b.max ? b.max: d,
                c.readHistoryMessage(b.id, b.type, d)
            }),
            d.on("keydown", "._MINFO-MSEARCH-TEXT_",
            function(a) {
                if (13 == a.which) {
                    var d, b = e(a);
                    d = b.pageNum,
                    d = d < b.min ? b.min: d,
                    d = d > b.max ? b.max: d,
                    c.readHistoryMessage(b.id, b.type, d)
                }
            })
        },
        _installChatPost: function() {
            var e, f, a = this.Data,
            b = this.View,
            d = (this.Memory, this);
            e = b.get("chatPanel"),
            f = a.getText("max"),
            e.on("click", "._MPUBLISH-POST_",
            function(a) {
                var e, f, g, c = a.target;
                e = c.getAttribute("data-id"),
                f = c.getAttribute("data-type"),
                1 == f ? g = "#" + b.getBaseId() + e + "CHAT-FRIEND-TEXT": 2 == f && (g = "#" + b.getBaseId() + e + "CHAT-TALK-TEXT"),
                d.pushMessage(g)
            }),
            e.on("keydown", "._MPUBLISH-TEXT_",
            function(a) {
                if (! ("undefined" != typeof a.ctrlKey ? a.ctrlKey: a.modifiers & Event.CONTROL_MASK > 0)) return ! 1;
                var b = a.which || a.button;
                13 == b && d.pushMessage(a.target)
            }),
            e.on("keyup", "._MPUBLISH-TEXT_",
            function(a) {
                var d, e, g, h, c = a.target;
                d = c.getAttribute("data-id"),
                e = c.getAttribute("data-type"),
                g = jBud(c),
                h = jBud.trim(g.val()),
                1 == e ? $tip = jBud("#" + b.getBaseId() + d + "CHAT-FRIEND-TEXT-TIP") : 2 == e && ($tip = jBud("#" + b.getBaseId() + d + "CHAT-TALK-TEXT-TIP")),
                $tip && f > 0 && (h.length > f ? $tip.addClass("_OVERFLOW_").html("\u60a8\u5df2\u7ecf\u8d85\u51fa" + (h.length - f) + "\u4e2a\u5b57\u7b26\u3002") : $tip.removeClass("_OVERFLOW_").html("\u60a8\u8fd8\u80fd\u8f93\u5165" + (f - h.length) + "\u4e2a\u5b57\u7b26\u3002"))
            })
        },
        readHistoryMessage: function(a, b, c) {
            var i, j, k, l, d = this.View,
            e = this.Data,
            f = this.Memory,
            g = this,
            h = d.getBaseId();
            1 == b ? (i = jBud("#" + h + a + "CHAT-FRIEND-RECORD-LIST"), j = jBud("#" + h + a + "CHAT-FRIEND-RECORD-TOTAL"), k = jBud("#" + h + a + "CHAT-FRIEND-RECORD-TEXT")) : 2 == b && (i = jBud("#" + h + a + "CHAT-TALK-RECORD-LIST"), j = jBud("#" + h + a + "CHAT-TALK-RECORD-TOTAL"), k = jBud("#" + h + a + "CHAT-TALK-RECORD-TEXT")),
            i.length <= 0 || (l = f.getUser(), "undefined" == typeof c && (c = d.parseFloat(k.val()), 0 === c && (c = void 0)), 1 == b ? e.queryHistoryMessageFriend({
                userId: l.userid,
                t_id: a,
                pageNum: c
            },
            function(a, c) {
                var e;
                if (a && c && (e = c.content)) {
                    for (var m, f = e.message,
                    h = [], n = 0; n < f.length; n++) m = f[n],
                    m.is_self = !(l.userid == m.f_id),
                    m.time = m.c_time,
                    m = g.transferMessage(m, b),
                    m = g.transferBubbleData(m, b),
                    h.push(m);
                    i.html(d.renderRecordList(h)),
                    j.text(e.totalNum),
                    k.val(e.pageNum),
                    delete c
                }
            }) : 2 == b && e.queryHistoryMessageTalk({
                g_id: a,
                pageNum: c
            },
            function(a, c) {
                var e;
                if (a && c && (e = c.content)) {
                    for (var l, f = e.message,
                    h = [], m = 0; m < f.length; m++) l = f[m],
                    l.send_id = l.f_id,
                    l.time = l.c_time,
                    l = g.transferMessage(l, b),
                    l = g.transferBubbleData(l, b),
                    h.push(l);
                    i.html(d.renderRecordList(h)),
                    j.text(e.totalNum),
                    k.val(e.pageNum),
                    delete c
                }
            }))
        },
        readOfflineMessage: function(a, b) {
            var g, h, c = this.View,
            d = this.Data,
            e = this.Memory,
            f = this;
            g = e.getUser(),
            h = e.getObject(a, b),
            1 == b ? d.queryHistoryMessageFriend({
                userId: g.userid,
                t_id: a
            },
            function(d, e) {
                if (d && e && e.content) {
                    var i = e.content.message,
                    j = c.parseFloat(h.offlineCount),
                    k = j < i.length ? i.length - j: 0;
                    i = i.slice(k).reverse();
                    for (var l = 0; l < i.length; l++) i[l].is_self = !(g.userid == i[l].f_id),
                    i[l].time = i[l].c_time,
                    f.prependBubble(f.transferMessage(i[l], b));
                    f.clearOfflineMessage(a, b)
                }
            }) : 2 == b && d.queryHistoryMessageTalk({
                g_id: a
            },
            function(d, e) {
                if (d && e && e.content) {
                    var g = e.content.message,
                    i = c.parseFloat(h.offlineCount),
                    j = i < g.length ? g.length - i: 0;
                    g = g.slice(j).reverse();
                    for (var k = 0; k < g.length; k++) g[k].send_id = g[k].f_id,
                    g[k].time = g[k].c_time,
                    f.prependBubble(f.transferMessage(g[k], b));
                    f.clearOfflineMessage(a, b)
                }
            })
        },
        clearOfflineMessage: function(a, b) {
            var g, h, i, c = this.View,
            d = this.Data,
            e = this.Memory;
            1 == b ? g = jBud("." + c.getBaseId() + a + "FRIENDTIP") : 2 == b && (g = jBud("." + c.getBaseId() + a + "TALKTIP")),
            g.addClass("_MHIDDEN_"),
            h = e.getUser(),
            d.pushClearOfflineMessage({
                type: b,
                send_id: h.userid,
                d_id: a
            }),
            i = e.getObject(a, b),
            i.offlineCount = 0,
            this.showFlashTip(!1)
        },
        showUnknownMessage: function(a, b) {
            var g, h, c = this.View,
            e = (this.Data, this.Memory);
            if (1 == b ? g = jBud("." + c.getBaseId() + a + "FRIENDTIP") : 2 == b && (g = jBud("." + c.getBaseId() + a + "TALKTIP")), g.removeClass("_MHIDDEN_"), h = e.getObject(a, b), h && h.message) {
                var i = this.getMaxCount(h.message.length + c.parseFloat(h.offlineCount));
                g.text(0 >= i ? "!": i),
                this.showFlashTip(!0)
            }
        },
        showFlashTip: function(a) {
            var g, h, b = this.View,
            e = (this.Data, this.Memory, this),
            f = !0;
            return g = jBud("#" + b.getBaseId() + "trayTip"),
            h = this.showFlashTip.timer,
            a ? (callback = this.showFlashTip.callback, callback || (callback = this.showFlashTip.callback = function() {
                document.title = f ? "\u3010\u60a8\u6709\u65b0\u6d88\u606f\u3011": e.getProperty("TITLE"),
                g.text("\u3010\u65b0\u6d88\u606f\u3011"),
                jBud("#_MPF-LATEST-TIP_").css("display", "block"),
                f = !f
            }), h || (h = this.showFlashTip.timer = setInterval(callback, 1e3)), void 0) : (h && clearInterval(h), h = this.showFlashTip.timer = void 0, g.text(""), document.title = this.getProperty("TITLE"), jBud("#_MPF-LATEST-TIP_").css("display", "none"), void 0)
        },
        pushMessage: function(a) {
            var f, g, h, i, j, k, b = this.Data,
            c = this.View,
            d = this.Memory,
            e = this;
            if (k = b.getText("max"), jBud.isPlainObject(a)) f = a.id,
            g = a.type,
            i = a.text;
            else {
                if (h = jBud(a), h.length <= 0) return;
                if (f = h.attr("data-id"), g = h.attr("data-type"), 1 == g ? j = jBud("#" + c.getBaseId() + f + "CHAT-FRIEND-TEXT-TIP") : 2 == g && (j = jBud("#" + c.getBaseId() + f + "CHAT-TALK-TEXT-TIP")), i = jBud.trim(h.val()), i.length <= 0) return j.html("\u96be\u9053\u6ca1\u6709\u4ec0\u4e48\u8981\u8bf4\u7684\u5417\uff1f"),
                h.val(i),
                void 0;
                if (k > 0 && i.length > k) return j.html("\u60a8\u5df2\u7ecf\u8d85\u51fa" + (i.length - k) + "\u4e2a\u5b57\u7b26\u3002"),
                void 0;
                j.html(""),
                i = c.renderChatText(i)
            }
            user = d.getUser(),
            d.isActive() && (1 == g ? b.pushFriendMessage({
                userId: user.userid,
                toId: f,
                context: i
            },
            function(a) {
                a.flag && (e.appendBubble({
                    type: 1,
                    id: f,
                    fromId: user.userid,
                    toId: f,
                    context: i,
                    method: "PUSH",
                    time: a.time
                }), e.turnFriendLine(f, a.online), h && h.val(""))
            }) : 2 == g && b.pushTalkMessage({
                send_id: user.userid,
                g_id: f,
                context: i
            },
            function(a) {
                a.flag && (e.appendBubble({
                    type: 2,
                    id: f,
                    fromId: user.userid,
                    toId: f,
                    context: i,
                    method: "PUSH",
                    time: a.time
                }), h && h.val(""))
            }))
        },
        transferBubbleData: function(a) {
            var h, b = this.Data,
            c = this.View,
            d = this.Memory,
            f = (a.id, a.method),
            g = a.type;
            return "PUSH" == f ? (h = d.getUser(), jBud.extend(a, {
                userName: h.username,
                nickName: h.nickname
            })) : "PULL" == f && (1 == g ? h = d.getFriend(a.id) : 2 == g && (h = d.getFriend(a.fromId), h || (h = d.getTalkMember(a.id, a.fromId))), h || (h = {
                userName: "",
                nickName: ""
            },
            a.defer = !0), jBud.extend(a, {
                userName: h.userName,
                nickName: h.nickName
            })),
            a.context = c.parseFaces(a.context, b.getFaceNames(), b.getFace()),
            a
        },
        prependRecent: function(a, b) {
            var f, g, h, c = this.View,
            d = this.Data,
            e = this.Memory;
            if (f = c.get("panelRecentList"), 1 == b ? h = "#" + c.getBaseId() + a + "RECENT-FRIEND": 2 == b && (h = "#" + c.getBaseId() + a + "RECENT-TALK"), g = jBud(h), g.length > 0) f.prepend(g);
            else {
                var i = "";
                1 == b ? i = c.renderFriend(e.getFriend(a), "RECENT") : 2 == b && (i = c.renderTalk(e.getTalk(a), "RECENT")),
                f.prepend(i)
            }
            var j = f.children(),
            k = d.getRecent("max");
            if (j.length > k) for (var l = k; l < j.length; l++) jBud(j[l]).remove()
        },
        appendBubble: function(a) {
            var i, j, k, m, n, c = (this.Data, this.View),
            d = this.Memory,
            f = a.id,
            g = a.type;
            return a.method,
            1 == g ? (i = jBud("#" + c.getBaseId() + f + "CHAT-FRIEND-BUBBLE"), j = jBud("#" + c.getBaseId() + f + "CHAT-FRIEND-CONTENT")) : 2 == g && (i = jBud("#" + c.getBaseId() + f + "CHAT-TALK-BUBBLE"), j = jBud("#" + c.getBaseId() + f + "CHAT-TALK-CONTENT")),
            k = c.get("chat"),
            n = k.css("display"),
            this.prependRecent(f, g),
            i.length <= 0 || "none" == n ? (d.saveMessage(a), this.showUnknownMessage(f, g), void 0) : (m = this.getProperty("CURRENT-CHAT"), !m || m.id == f && m.type == g || this.showUnknownMessage(f, g), a = this.transferBubbleData(a), i.append(c.renderChatBubble(a)), j.scrollTop(i.height()), void 0)
        },
        prependBubble: function(a) {
            var e, f, b = this.View,
            c = a.id,
            d = a.type;
            1 == d ? (e = jBud("#" + b.getBaseId() + c + "CHAT-FRIEND-BUBBLE"), f = jBud("#" + b.getBaseId() + c + "CHAT-FRIEND-CONTENT")) : 2 == d && (e = jBud("#" + b.getBaseId() + c + "CHAT-TALK-BUBBLE"), f = jBud("#" + b.getBaseId() + c + "CHAT-TALK-CONTENT")),
            e.length <= 0 || (a = this.transferBubbleData(a), e.prepend(b.renderChatBubble(a)), f.scrollTop(e.height()))
        },
        appendHistoryBubble: function(a, b) {
            var e, f, g, c = this.Memory;
            if (this.View, 1 == b ? f = c.getFriend(a) : 2 == b && (f = c.getTalk(a)), f) for (e = f.message; g = e.shift();) this.appendBubble(g)
        },
        activeDeferBubble: function(a) {
            var d, e, b = this.View,
            c = this.Memory;
            if (d = c.getTalk(a), d && (e = d.members)) for (var f in e) {
                var g = e[f];
                jBud("." + b.getBaseId() + "2" + g.userId + "BUBBLE-DEFER-NAME").html(g.nickName),
                jBud("." + b.getBaseId() + "2" + g.userId + "BUBBLE-DEFER-HEAD").attr("src", b.getHead().small + g.userName)
            }
        },
        _installChatTalk: function() {
            var d, a = this.View,
            c = (this.Data, this);
            d = a.get("chatPanel"),
            d.on("click", "._MTOOLS-TALK_",
            function(a) {
                var d, e, b = a.target;
                d = b.getAttribute("data-id"),
                e = b.getAttribute("data-type"),
                c.activeTalk(d, e)
            })
        },
        _installChatTalkQuit: function() {
            var c, a = this.View,
            b = this;
            c = a.get("chatPanel"),
            c.on("click", "._MTOOLS-TALK-QUIT_",
            function(a) {
                var d, e, c = a.target;
                d = c.getAttribute("data-id"),
                e = c.getAttribute("data-type"),
                b.quitTalk(d, e)
            })
        },
        quitTalk: function(a) {
            var f, g, c = this.Data,
            d = this.Memory,
            e = this;
            g = d.getTalk(a),
            f = d.getUser(),
            confirm('\u786e\u5b9a\u8981\u9000\u51fa"' + g.title + '"\u8ba8\u8bba\u7ec4\u5417\uff1f') && c.pushTalkQuit({
                g_id: a,
                userId: f.userid,
                exitId: f.userid
            },
            function(a) {
                a.flag ? e.dispatch(a, 2) : alert("\u64cd\u4f5c\u5931\u8d25\uff0c" + a.desc)
            })
        },
        _installChatFaces: function() {
            var d, a = this.View,
            b = this.Data;
            d = a.get("chatPanel"),
            d.on("click", "._MTOOLS-FACE_",
            function(c) {
                var e, f, g, h, i, d = c.target;
                e = d.getAttribute("data-id"),
                f = d.getAttribute("data-type"),
                g = jBud(d),
                h = g.next(),
                i = h.attr("rendered"),
                "true" != i && (h.attr("rendered", "true"), h.html(a.renderChatFaces(b.getFaceNames(), b.getFace(), e, f))),
                h.toggleClass("_MHIDDEN_")
            }),
            d.on("click", "._MFACE-ITEM_",
            function(b) {
                var d, e, f, g, h, c = b.target;
                d = c.getAttribute("data-id"),
                e = c.getAttribute("data-type"),
                f = c.getAttribute("data-face"),
                h = jBud("#" + a.getBaseId() + d + e + "FACES-LAYER"),
                1 == e ? g = jBud("#" + a.getBaseId() + d + "CHAT-FRIEND-TEXT") : 2 == e && (g = jBud("#" + a.getBaseId() + d + "CHAT-TALK-TEXT")),
                !g || g.length <= 0 || (a.renderLightToText(g[0], a.renderFaceFlag(f)), h.addClass("_MHIDDEN_"))
            }),
            d.on("click", "._MPUBLISH-TEXT_",
            function(b) {
                var d, e, f, c = b.target;
                d = c.getAttribute("data-id"),
                e = c.getAttribute("data-type"),
                f = jBud("#" + a.getBaseId() + d + e + "FACES-LAYER"),
                f.addClass("_MHIDDEN_")
            })
        },
        _installChatPreview: function() {
            var c, a = this.View,
            b = this;
            c = a.get("chatPanel"),
            c.on("click", "._MPREVIEW-IMAGE_",
            function(a) {
                var c = a.target;
                b.showPreviewImage({
                    src: c.src,
                    title: c.getAttribute("title")
                })
            })
        },
        showPreviewImage: function(a) {
            var c, d, e, f, g, h, i, j, k, b = this.View;
            c = b.get("preview"),
            g = jBud(window),
            h = g.width(),
            i = g.height(),
            j = .8 * h,
            k = .8 * i,
            c.length <= 0 && (b.node("body").append(b.renderPreview()), c = b.reload("preview")),
            d = b.get("previewContent"),
            e = b.reload("previewImage"),
            e.length > 0 && e.remove(),
            c.show(),
            c.width(g.width() + "px"),
            c.height(g.height() + "px"),
            f = new Image,
            f.title = a.title,
            f.src = a.src,
            f.id = b.getBaseId() + "previewImage";
            var l = function() {
                var a = f.width,
                b = f.height,
                e = c.width(),
                g = c.height();
                a > j && (b = Math.floor(b * (j / a)), a = j),
                b > k && (a = Math.floor(a * (k / b)), b = k),
                f.width = a,
                f.height = b,
                d.css({
                    left: e - a + "px",
                    top: (g - b) / 2 + "px",
                    opacity: 0
                }),
                d.action({
                    left: (e - a) / 2,
                    top: (g - b) / 2,
                    opacity: 1
                },
                {
                    queue: !1,
                    duration: 400
                })
            };
            "complete" == f.readyState ? l() : f.onload = function() {
                l()
            },
            d.prepend(f),
            c.css("opacity", 0),
            c.action({
                opacity: 1
            },
            {
                duration: 800,
                queue: !1
            }),
            this.installPreviewImage()
        },
        closePreviewImage: function() {
            var b, c, a = this.View;
            b = a.get("preview"),
            c = a.get("previewContent"),
            c.action({
                left: 0,
                opacity: 0
            },
            {
                queue: !1,
                duration: 800,
                complete: function() {
                    b.hide()
                }
            }),
            b.action({
                opacity: 0
            },
            {
                queue: !1,
                duration: 800
            })
        },
        installPreviewImage: function() {
            var c, d, a = this.View,
            b = this;
            this.installPreviewImage.invoked || (this.installPreviewImage.invoked = !0, c = a.get("preview"), d = a.get("previewContent"), c.on("click", "._MPREVIEW-CLOSE_",
            function() {
                b.closePreviewImage()
            }), c.on("click",
            function(a) {
                b.closePreviewImage(),
                a.stopPropagation()
            }), jBud(window).on("resize",
            function() {
                var a = jBud(this),
                b = a.width(),
                e = a.height();
                cWidth = d.width(),
                cHeight = d.height(),
                c.width(b + "px"),
                c.height(e + "px"),
                d.action({
                    left: (b - cWidth) / 2,
                    top: (e - cHeight) / 2
                },
                {
                    queue: !1,
                    duration: 800
                })
            }))
        },
        installChatImage: function(a, b) {
            var g, h, c = this.View,
            d = this.Data,
            e = c.getBaseId(),
            f = this;
            h = this.installChatImage.installed,
            h || (h = this.installChatImage.installed = {}),
            h[a + "-" + b] || (h[a + "-" + b] = !0, g = e + a + b + "CHAT-IMAGE-UPLOAD", tipId = "#" + e + a + b + "CHAT-UPLOAD-TIP", c.renderImageUpload({
                uploadUrl: d.getUpload(),
                flashUrl: d.getSWFUpload(),
                targetId: g,
                callback: function(c, d) {
                    200 == c ? (200 == d.code || d.flag ? f.pushMessage({
                        id: a,
                        type: b,
                        text: '<img src="' + d.url + '" alt="' + d.fileName + '" title="' + d.fileName + '" class="_MPREVIEW-IMAGE_"/>'
                    }) : alert(d.description || d.desc), jBud(tipId).addClass("_MHIDDEN_")) : 201 == c ? jBud(tipId).removeClass("_MHIDDEN_").text(d) : (jBud(tipId).addClass("_MHIDDEN_"), alert(d))
                }
            }))
        },
        installChatAnnex: function(a, b) {
            var g, h, i, c = this.View,
            d = this.Data,
            e = c.getBaseId(),
            f = this;
            h = this.installChatAnnex.installed,
            h || (h = this.installChatAnnex.installed = {}),
            h[a + "-" + b] || (h[a + "-" + b] = !0, g = e + a + b + "CHAT-ANNEX-UPLOAD", i = "#" + e + a + b + "CHAT-UPLOAD-TIP", c.renderAnnexUpload({
                uploadUrl: d.getUpload(),
                flashUrl: d.getSWFUpload(),
                targetId: g,
                callback: function(c, d) {
                    200 == c ? (200 == d.code || d.flag ? f.pushMessage({
                        id: a,
                        type: b,
                        text: '<a href="' + d.url + '" target="_blank">\u70b9\u51fb\u4e0b\u8f7d"' + d.fileName + '"</a>'
                    }) : alert(d.description || d.desc), jBud(i).addClass("_MHIDDEN_")) : 201 == c ? (console.log("there"), jBud(i).removeClass("_MHIDDEN_").text(d)) : (alert(d), jBud(i).addClass("_MHIDDEN_"))
                }
            }))
        },
        activeTalk: function(a, b) {
            var f, c = this.View;
            this.Data,
            this.Memory,
            f = c.get("talk"),
            f.length <= 0 && (c.node("body").append(c.renderTalkFramework()), f = c.reload("talk"), f.css({
                opacity: 0,
                right: "240px"
            })),
            this.installTalk(),
            f.show(),
            f.action({
                opacity: 1,
                right: 365
            },
            {
                queue: !1
            }),
            "undefined" != typeof a && "undefined" != typeof b && this.buildTalkTree(a, b)
        },
        buildTalkTree: function(a, b) {
            var f, g, h, i, j, k, l, m, n, o, p, q, c = this.View,
            d = this.Data,
            e = this.Memory;
            if (g = c.get("talk"), !(g.length <= 0)) if (h = c.get("talkTree"), l = g.attr("data-build"), p = g.attr("data-id"), q = g.attr("data-type"), "true" == l && (h.html(c.renderTalkTree(e)), g.attr("data-build", !1)), i = c.get("talkMax"), i.text(d.getTalk("max")), (p != a || q != b) && this.clearTalkFriend(), g.attr({
                "data-id": a,
                "data-type": b
            }), k = c.get("talkTitle"), k.text("\u521b\u5efa\u8ba8\u8bba\u7ec4"), j = c.get("talkName"), j.val("").removeAttr("readonly"), m = e.getUser(), f = e.getTalkTemp(), this.pushTalkFriend("SELF", b, !0), 1 == b) this.pushTalkFriend(a, b);
            else if (2 == b && (k.text("\u6dfb\u52a0\u8ba8\u8bba\u7ec4\u6210\u5458"), n = e.getTalk(a), n && (f.name = n.title, f.id = n.g_id, j.val(n.title), j.attr("readonly", "readonly"), o = n.members))) for (var r in o) this.pushTalkFriend({
                talkId: a,
                friendId: r
            },
            b, !0)
        },
        inactiveTalk: function() {
            var c, a = this.View;
            c = a.get("talk"),
            c.length <= 0 || c.action({
                opacity: 0,
                right: 240
            },
            {
                queue: !1,
                complete: function() {
                    c.hide()
                }
            })
        },
        installTalk: function() {
            var d, a = this.View,
            b = this.Memory,
            c = this;
            this.installTalk.invoked || (this.installTalk.invoked = !0, d = a.get("talk"), d.on("click", "._MTOOLS-CLOSE_",
            function() {
                c.inactiveTalk()
            }), d.on("click", "._MTG-TREE-TITLE_",
            function(a) {
                var b = a.target,
                c = jBud(b);
                c.toggleClass("_SELECTED_"),
                c.next().toggleClass("_MHIDDEN_")
            }), d.on("click", "._MTOOLS-USER_",
            function(a) {
                var d, b = a.target;
                d = b.getAttribute("data-id"),
                c.pushTalkFriend(d, 1)
            }), d.on("click", "._MTOOLS-REMOVE_",
            function(a) {
                var b = a.target;
                id = b.getAttribute("data-id"),
                c.removeTalkFriend(id)
            }), d.on("click", "._MTOOLS-GROUP_",
            function(a) {
                var e, f, g, d = a.target;
                if (e = d.getAttribute("data-id"), f = b.getGroup(e), f && (g = f.users)) for (var h = 0; h < g.length; h++) c.pushTalkFriend(g[h], 1)
            }), d.on("click", "._MTOOLS-SUBMIT_",
            function() {
                c.submitTalkFriend()
            }))
        },
        clearTalkFriend: function() {
            var c, a = this.View,
            b = this.Memory;
            c = a.get("talkPool"),
            jBud("._MTG-LIST-ITEM_").removeClass("_SELECTED"),
            c.empty(),
            b.clearTalkTemp()
        },
        pushTalkFriend: function(a, b, c) {
            var g, h, i, j, d = this.View,
            e = this.Data,
            f = this.Memory;
            if (g = d.get("talkPool"), i, "SELF" == a ? i = f.getUser() : 1 == b ? i = f.getFriend(a) : 2 == b && (i = f.getFriend(a.friendId), i || (i = f.getTalkMember(a.talkId, a.friendId))), !(g.length <= 0) && i) {
                if ("SELF" == a && jBud.extend(i, {
                    userName: i.username,
                    nickName: i.nickname,
                    userId: i.userid
                }), j = f.getTalkTemp(), !f.existTalkTempFriend(i.userId)) {
                    if (j.length >= e.getTalk("max")) return alert("\u8ba8\u8bba\u7ec4\u4eba\u6570\u5df2\u7ecf\u8fbe\u5230\u4e0a\u9650"),
                    void 0;
                    g.append(d.renderTalkPoolItem(i, !!c)),
                    f.pushTalkTempFriend(i.userId, !!c),
                    jBud("." + d.getBaseId() + i.userId + "TALK-USER").addClass("_SELECTED_")
                }
                h = d.get("talkSelected"),
                h.text(j.length)
            }
        },
        removeTalkFriend: function(a) {
            var e, f, b = this.View,
            c = this.Memory,
            d = b.getBaseId();
            jBud("#" + d + a + "TALK-POOL").remove(),
            jBud("." + d + a + "TALK-USER").removeClass("_SELECTED_"),
            c.removeTalkTempFriend(a),
            f = c.getTalkTemp(),
            e = b.get("talkSelected"),
            e.text(f.length)
        },
        submitTalkFriend: function() {
            var f, g, h, i, j, a = this.View,
            b = this.Memory,
            c = this.Data,
            d = this;
            if (a.getBaseId(), f = b.getTalkTemp(), g = a.get("talkName"), h = jBud.trim(g.val()), i = b.getUser(), f) {
                j = [];
                for (var k in f.friends) j.push({
                    id: k
                });
                if ("undefined" == typeof f.id) {
                    if (h.length <= 0) return g.emit("focus"),
                    alert("\u8bf7\u586b\u5199\u8ba8\u8bba\u7ec4\u540d\u79f0"),
                    void 0;
                    if (h.length > 10) return alert("\u8ba8\u8bba\u7ec4\u540d\u5b57\u4e0d\u80fd\u8d85\u8fc710\u4e2a\u5b57\u7b26"),
                    void 0;
                    f.name = h,
                    c.pushTalkCreate({
                        send_id: i.userid,
                        title: f.name,
                        join_ids: j
                    },
                    function(a) {
                        a.flag ? (d.dispatch(a, 2), d.inactiveTalk()) : alert("\u64cd\u4f5c\u5931\u8d25\uff0c" + a.desc)
                    })
                } else c.pushTalkJoin({
                    g_id: f.id,
                    send_id: i.userid,
                    join_ids: j
                },
                function(a) {
                    a.flag ? (d.dispatch(a, 2), d.inactiveTalk()) : alert("\u64cd\u4f5c\u5931\u8d25\uff0c" + a.desc)
                })
            }
        },
        getChatTitleAndPanel: function(a, b) {
            var d, e, f, g, c = this.View;
            return 1 == b ? (f = "#" + c.getBaseId() + a + "CHAT-FRIEND-TITLE", g = "#" + c.getBaseId() + a + "CHAT-FRIEND-PANEL") : 2 == b && (f = "#" + c.getBaseId() + a + "CHAT-TALK-TITLE", g = "#" + c.getBaseId() + a + "CHAT-TALK-PANEL"),
            d = jBud(f),
            e = jBud(g),
            {
                title: d,
                panel: e,
                titleSelector: f,
                panelSelector: g
            }
        },
        installResize: function() {
            var a = this.View,
            b = this;
            this.installResize.once = !0,
            this.installResize.invoked || (this.installResize.invoked = !0, a.node(window).on("resize",
            function() {
                var a = b.getState("ACTIVED");
                a && b.resizePanel()
            }))
        },
        resizePanel: function() {
            var a = this.View,
            b = this._panelHeight(),
            c = b - this.getProperty("panelTitleHeight") - this.getProperty("panelContentBorder"),
            d = c - this.getProperty("panelTopHeight") - this.getProperty("panelFuncHeight") - 5,
            e = d + this.getProperty("panelFuncHeight");
            a.get("panelContent").height(c + "px"),
            a.get("panelList").children("li").height(d + "px"),
            a.get("panelSearchResult").height(e + "px"),
            a.get("panel").action({
                height: b
            },
            {
                queue: !1
            })
        },
        _panelHeight: function() {
            var e, a = this.View,
            b = a.node(window);
            return a.get("message"),
            a.get("tray"),
            e = a.parseFloat(b.height()) - this.getProperty("trayHeight") - this.getProperty("messageBorder")
        },
        setProperties: function() {
            var a = this.View,
            b = this.Memory,
            c = a.get("tray"),
            d = a.get("message"),
            e = a.get("panelTitle"),
            f = a.get("panelTop"),
            g = a.get("panelFunc");
            b.property({
                trayHeight: a.parseFloat(c.outerHeight(!0)),
                messageBorder: a.parseFloat(d.borderHeight()),
                panelTitleHeight: a.parseFloat(e.outerHeight(!0)) + a.parseFloat(e.borderHeight()),
                panelContentBorder: a.parseFloat(a.get("panelContent").borderHeight()),
                panelTopHeight: a.parseFloat(f.outerHeight(!0)) + a.parseFloat(f.borderHeight()),
                panelFuncHeight: a.parseFloat(g.outerHeight(!0)) + a.parseFloat(g.borderHeight())
            })
        },
        getProperty: function(a) {
            var b = this.Memory;
            return b.property(a) || 0
        },
        removeProperty: function(a) {
            var b = this.Memory;
            b.removeProperties(a)
        },
        setState: function(a, b) {
            this.state[a] = b
        },
        getState: function(a) {
            return this.state[a]
        },
        clearState: function() {
            delete this.state,
            this.state = {}
        }
    });
    var e = function() {
        this.user = {
            nickname: void 0,
            userid: void 0,
            username: void 0
        },
        this.relationship = {
            groups: {},
            friends: {},
            talks: {},
            recent: {},
            originalFriend: void 0,
            originalTalk: void 0,
            originalRecent: void 0
        },
        this.messageCache = {},
        this.properties = {},
        this.temp = {},
        this.talk = {
            id: void 0,
            name: void 0,
            friends: {},
            length: 0
        },
        this.indexes = {
            friends: {},
            talks: {}
        },
        this.skin = void 0
    };
    jBud.extend(e.prototype, {
        setSkin: function(a) {
            this.skin = a
        },
        getSkin: function() {
            return this.skin
        },
        setUser: function(a) {
            jBud.extend(this.user, a)
        },
        clearUser: function() {
            jBud.extend(this.user, {
                nickname: void 0,
                userid: void 0,
                username: void 0
            })
        },
        getUser: function() {
            return this.user
        },
        clearAll: function() {
            this.clearUser(),
            delete this.relationship,
            this.relationship = {
                groups: {},
                friends: {},
                talks: {},
                recent: {},
                originalFriend: void 0,
                originalTalk: void 0,
                originalRecent: void 0
            },
            delete this.messageCache,
            this.messageCache = {},
            delete this.properties,
            this.properties = {},
            delete this.temp,
            this.temp = {},
            delete this.talk,
            this.talk = {
                id: void 0,
                name: void 0,
                friends: {},
                length: 0
            },
            delete this.indexes,
            this.indexes = {
                friends: {},
                talks: {}
            },
            delete this.skin,
            this.skin = void 0
        },
        isActive: function() {
            return this.user && void 0 !== this.user.userid
        },
        saveRelationship: function(a) {
            if (!a) return this.relationship;
            var b = this.relationship,
            c = b.groups,
            d = b.friends,
            e = this.indexes;
            c || (c = b.groups = {}),
            d || (d = b.friends = {});
            for (var f = 0; f < a.length; f++) {
                var g = a[f];
                c[g.groupId] = {
                    name: g.groupName,
                    isRoot: !1,
                    users: [],
                    groupId: g.groupId
                };
                for (var h = g.groupMember,
                i = c[g.groupId].users, j = 0; j < h.length; j++) {
                    var k = h[j];
                    i.push(k.userId),
                    d[k.userId] = {
                        nickName: k.nickName,
                        online: k.online,
                        userName: k.userName,
                        groupId: g.groupId,
                        userId: k.userId,
                        message: []
                    }
                }
            }
            for (var l in d) {
                var n, m = d[l];
                n = e.friends[m.nickName],
                n || (n = e.friends[m.nickName] = []),
                n.push(m.userId)
            }
            return a.root = {
                groupName: "\u6211\u7684\u597d\u53cb",
                groupMember: b.friends,
                groupId: "ROOT"
            },
            c.ROOT = {
                isRoot: !0,
                groupName: "\u6211\u7684\u597d\u53cb",
                users: b.friends
            },
            b.originalFriend = a,
            this.relationship
        },
        saveFriend: function(a) {
            if (a) {
                var g, b = this.relationship,
                d = (b.groups, b.friends),
                e = this.indexes;
                d[a.userId] = {
                    nickName: a.nickName,
                    online: a.online,
                    userName: a.userName,
                    groupId: a.groupId,
                    userId: a.userId,
                    message: a.message
                },
                g = e.friends[a.nickName],
                g || (g = e.friends[a.nickName] = []),
                g.push(a.userId)
            }
        },
        getRelationship: function() {
            return this.relationship
        },
        getGroups: function() {
            return this.relationship.groups
        },
        getGroup: function(a) {
            return this.getGroups()[a]
        },
        saveTalk: function(a) {
            if (!a || !a.groupInfo) return this.relationship;
            var b = this.relationship,
            c = b.talks,
            d = this.indexes;
            c || (c = b.talks = {});
            for (var e = 0; e < a.groupInfo.length; e++) {
                var g, f = a.groupInfo[e];
                c[f.g_id] = {
                    owner: f.owner,
                    title: f.title,
                    g_id: f.g_id,
                    message: [],
                    members: {}
                },
                g = d.talks[f.title],
                g || (g = d.talks[f.title] = []),
                g.push(f.g_id)
            }
            return b.originalTalk = a,
            this.relationship
        },
        saveTalkMembers: function(a, b) {
            if (!b) return this.relationship;
            var e, c = this.relationship,
            d = c.talks;
            d || (d = c.talks = {}),
            e = d[a],
            e || (e = d[a] = {
                owner: void 0,
                title: "UNKNOWN",
                g_id: a,
                message: [],
                members: {}
            });
            for (var f = 0; f < b.length; f++) {
                var g = b[f];
                e.members[g.userId] = {
                    userId: g.userId,
                    userName: g.userName,
                    nickName: g.nickName
                }
            }
            return this.relationship
        },
        saveRecent: function(a) {
            if (!a || !a.userInfo) return this.relationship;
            var b = this.relationship,
            c = b.recents;
            c || (c = b.recents = {});
            for (var d = 0; d < a.userInfo.length; d++) {
                var e = a.userInfo[d];
                c[e.type + "-" + e.userId] = {
                    type: e.type,
                    id: e.userId
                },
                1 == e.type ? e.target = b.friends[e.userId] : 2 == e.type && (e.target = b.talks[e.userId])
            }
            return b.originalRecent = a,
            this.relationship
        },
        saveMessage: function(a) {
            if (a) {
                var b;
                1 == a.type ? b = this.getFriend(a.id) : 2 == a.type && (b = this.getTalk(a.id)),
                b && b.message.push(a)
            }
        },
        getFriend: function(a) {
            return this.relationship.friends[a]
        },
        getTalk: function(a) {
            return this.relationship.talks[a]
        },
        existTalk: function(a) {
            return a in this.relationship.talks
        },
        removeTalk: function(a) {
            var b = this.relationship.talks;
            a in b && delete b[a]
        },
        getTalkOrSave: function(a) {
            if (!a) return void 0;
            var d, b = this.getTalk(a.g_id),
            c = this.indexes;
            if (b) return b;
            var e = this.relationship.talks;
            return e[a.g_id] = {
                owner: a.send_id,
                title: a.title,
                g_id: a.g_id,
                message: [],
                members: {}
            },
            d = c.talks[a.title],
            d || (d = c.talks[a.title] = []),
            d.push(a.g_id),
            e[a.g_id]
        },
        getObject: function(a, b) {
            return 1 == b ? this.getFriend(a) : 2 == b ? this.getTalk(a) : void 0
        },
        getTalkMember: function(a, b) {
            var c = this.getTalk(a);
            return c && c.members ? c.members[b] : void 0
        },
        removeTalkMember: function(a, b) {
            var c = this.getTalk(a);
            return c && c.members ? (delete c.members[b], void 0) : void 0
        },
        clearTalkTemp: function() {
            var a = this.talk;
            a.name = void 0,
            a.id = void 0,
            a.friends = void 0,
            a.length = 0,
            a.friends = {}
        },
        isTalkTempEmpty: function() {
            return this.talk.length <= 0
        },
        getTalkTemp: function() {
            return this.talk
        },
        pushTalkTempFriend: function(a, b) {
            this.talk.friends[a] = !!b,
            this.talk.length++
        },
        removeTalkTempFriend: function(a) {
            a in this.talk.friends && (delete this.talk.friends[a], this.talk.length--),
            this.talk.length < 0 && (this.talk.length = 0)
        },
        existTalkTempFriend: function(a) {
            return a in this.talk.friends
        },
        matchIndexes: function(a) {
            if ("undefined" == typeof a) return void 0;
            var b = this.indexes.friends,
            c = this.indexes.talks,
            d = new RegExp("(" + a + ")", "ig"),
            e = {
                friends: {},
                talks: {}
            };
            for (var f in b) {
                var g = b[f];
                if (d.test(f)) for (var h = 0; h < g.length; h++) {
                    var i = this.getFriend(g[h]);
                    i && (e.friends[i.userId] = i)
                }
            }
            for (var f in c) {
                var j = c[f];
                if (d.test(f)) for (var h = 0; h < j.length; h++) {
                    var k = this.getTalk(j[h]);
                    k && (e.talks[k.g_id] = k)
                }
            }
            return e
        },
        property: function(a, b) {
            if ("undefined" == typeof b) {
                if (jBud.isPlainObject(a)) {
                    for (var c in a) this.properties[c] = a[c];
                    return this
                }
                return this.properties[a]
            }
            return this.properties[a] = b,
            this
        },
        removeProperties: function() {
            if (! (arguments.length <= 0)) for (var a = 0; a < arguments.length; a++) {
                var b = arguments[a];
                "undefiend" != typeof b && this.properties[b] && delete this.properties[b]
            }
        },
        clearProperties: function() {
            delete this.properties,
            this.properties = {}
        },
        pushTemp: function(a, b) {
            return this.temp[a] = b,
            this
        },
        getTemp: function(a) {
            var b = this.temp[a];
            return delete this.temp[a],
            b
        },
        removeTemp: function(a) {
            delete this.temp[a]
        },
        pushMessageCache: function(a) {
            var c, b = this.messageCache;
            a && (c = b[a.id], c || (c = b[a.id] = []), c.push(a))
        },
        pickMessageCache: function(a) {
            var c, b = this.messageCache;
            return c = b[a],
            c && delete b[a],
            c
        }
    }),
    c.exports = {
        Message: d
    }
});