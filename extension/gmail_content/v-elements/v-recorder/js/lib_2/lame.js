(function(v) {
    "object" === typeof exports && "undefined" !== typeof module ? module.exports = v() : "function" === typeof define && define.amd ? define([], v) : ("undefined" !== typeof window ? window : "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : this).lameworker = v()
}
)(function() {
    return function h(c, l, a) {
        function e(d, m) {
            if (!l[d]) {
                if (!c[d]) {
                    var b = "function" == typeof require && require;
                    if (!m && b)
                        return b(d, !0);
                    if (t)
                        return t(d, !0);
                    b = Error("Cannot find module '" + d + "'");
                    throw b.code = "MODULE_NOT_FOUND",
                    b;
                }
                b = l[d] = 
                {
                    exports: {}
                };
                c[d][0].call(b.exports, function(k) {
                    var b = c[d][1][k];
                    return e(b ? b : k)
                }
                , b, b.exports, h, c, l, a)
            }
            return l[d].exports
        }
        for (var t = "function" == typeof require && require, m = 0; m < a.length; m++)
            e(a[m]);
        return e
    }
    ({
        1: [function(h, c, l) {
            function a(a) {
                a || (a = "lame.worker.js");
                a = new Worker(a);
                return e(a, {
                    functionNames: "getVersion init initParams close getMode setMode getNumSamples setNumSamples getNumChannels setNumChannels getInSampleRate setInSampleRate getOutSampleRate setOutSampleRate getBitrate setBitrate getVariableBitrate setVariableBitrate getVariableBitrateQuality setVariableBitrateQuality getVariableBitrateMean setVariableBitrateMean getVariableBitrateMin setVariableBitrateMin getVariableBitrateMax setVariableBitrateMax encodeBuffer encodeFlush".split(" ")
                })
            }
            var e = h("workerproxy");
            a.BUFFER_SIZE = 8192;
            a.STEREO = 0;
            a.JOINT_STEREO = 1;
            a.MONO = 3;
            c.exports = a
        }
        , {
            workerproxy: 2
        }],
        2: [function(h, c, l) {
            (function(a) {
                (function(e) {
                    function l(k) {
                        return {
                            name: k.name,
                            message: k.message,
                            stack: k.stack
                        }
                    }
                    function m(k, a) {
                        function b(k) {
                            function a() {
                                var b = Array.prototype.slice.call(arguments);
                                self.postMessage({
                                    callResponse: k,
                                    arguments: b
                                })
                            }
                            a._autoDisabled = !1;
                            a.disableAuto = function() {
                                a._autoDisabled = !0
                            }
                            ;
                            a.transfer = function() {
                                var a = Array.prototype.slice.call(arguments)
                                  , b = a.shift();
                                self.postMessage({
                                    callResponse: k,
                                    arguments: a
                                }, b)
                            }
                            ;
                            return a
                        }
                        if ("undefined" == typeof Proxy) {
                            var d = [], c;
                            for (c in k)
                                d.push(c);
                            self.postMessage({
                                functionNames: d
                            })
                        }
                        self.addEventListener("message", function(d) {
                            var c = d.data;
                            if (c.call) {
                                var f = c.callId;
                                if (d = k[c.call]) {
                                    c = c.arguments || [];
                                    f = b(f);
                                    c.push(f);
                                    var w;
                                    if (a.catchErrors)
                                        try {
                                            w = d.apply(k, c)
                                        } catch (h) {
                                            f(l(h))
                                        }
                                    else
                                        w = d.apply(k, c);
                                    a.autoCallback && !f._autoDisabled && f(null , w)
                                } else
                                    self.postMessage({
                                        callResponse: f,
                                        arguments: [l(Error("That function does not exist"))]
                                    })
                            }
                        }
                        )
                    }
                    function d(a, b) {
                        function c() {
                            return q.length + 
                            u.reduce(function(a, b) {
                                return a + b
                            }
                            )
                        }
                        function d(b, p) {
                            if ("pendingCalls" == p)
                                return c();
                            if (f[p])
                                return f[p];
                            var g = f[p] = function() {
                                var a = Array.prototype.slice.call(arguments);
                                q.push([p, a, void 0]);
                                h()
                            }
                            ;
                            g.broadcast = function() {
                                for (var b = Array.prototype.slice.call(arguments), d = 0; d < a.length; d++)
                                    l(d, p, b);
                                n && (n.pendingCalls = c())
                            }
                            ;
                            g.transfer = function() {
                                var a = Array.prototype.slice.call(arguments)
                                  , b = a.shift();
                                q.push([p, a, b]);
                                h()
                            }
                            ;
                            return g
                        }
                        function h() {
                            n && (n.pendingCalls = c());
                            if (q.length)
                                for (var b = 0; b < a.length; b++)
                                    if (!u[b]) {
                                        var d = 
                                        q.shift();
                                        l(b, d[0], d[1], d[2]);
                                        if (!q.length)
                                            break
                                    }
                        }
                        function l(d, c, g, h) {
                            u[d]++;
                            d = a[d];
                            var f = t++
                              , e = g[g.length - 1];
                            "function" == typeof e && (m[f] = e,
                            g = g.slice(0, -1));
                            b.timeCalls && (e = c + "(" + g.join(", ") + ")",
                            r[f] = e,
                            console.time(e));
                            d.postMessage({
                                callId: f,
                                call: c,
                                arguments: g
                            }, h)
                        }
                        function e(c) {
                            var f = a.indexOf(this);
                            c = c.data;
                            if (c.callResponse) {
                                var g = c.callResponse;
                                m[g] && (m[g].apply(null , c.arguments),
                                delete m[g]);
                                b.timeCalls && r[g] && (console.timeEnd(r[g]),
                                delete r[g]);
                                u[f]--;
                                h()
                            } else
                                c.functionNames && c.functionNames.forEach(function(a) {
                                    n[a] = 
                                    d(null , a)
                                }
                                )
                        }
                        var f = {}, m = {}, r, t = 1, n, q = [], u = a.map(function() {
                            return 0
                        }
                        );
                        b.timeCalls && (r = {});
                        "undefined" == typeof Proxy && (n = {
                            pendingCalls: 0
                        },
                        b.functionNames.forEach(function(a) {
                            n[a] = d(null , a)
                        }
                        ));
                        for (var x = 0; x < a.length; x++)
                            a[x].addEventListener("message", e);
                        return "undefined" == typeof Proxy ? n : Proxy.create ? Proxy.create({
                            get: d
                        }) : new Proxy({},{
                            get: d
                        })
                    }
                    function h(a, b) {
                        var c = {
                            autoCallback: !1,
                            catchErrors: !1,
                            functionNames: [],
                            timeCalls: !1
                        };
                        if (b)
                            for (var e in b)
                                e in c && (c[e] = b[e]);
                        Object.freeze(c);
                        "undefined" != typeof Worker && 
                        a instanceof Worker && (a = [a]);
                        if (Array.isArray(a))
                            return d(a, c);
                        m(a, c)
                    }
                    if (e)
                        c.exports = h;
                    else {
                        var b;
                        "undefined" != typeof a ? b = a : "undefined" != typeof window ? b = window : "undefined" != typeof self && (b = self);
                        b.createWorkerProxy = h
                    }
                }
                )("undefined" != typeof c && c.exports)
            }
            ).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {})
        }
        , {}]
    }, {}, [1])(1)
}
);