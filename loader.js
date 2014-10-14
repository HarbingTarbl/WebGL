"use strict"

var loader = (function(_loader) {
    var loader = {
        load: function(content) {
            if (typeof content === "function") {
                var promise = new Promsise(function(accept, reject) {
                    return content(accept, reject);
                });
                promise.thenLoad = function(content) {
                    this.then(function(accept, reject) {
                        return _loader.load(content);
                    });
                };
                return promise;
            } else if (typeof content === "string") {
                var filetype = content.substr(content.lastIndexOf(".") + 1);
                var handler = this[filetype];
                if (typeof handler === "undefined") {
                    console.log("Error, unknown content handler");
                    return null;
                } else {
                    var promise = handler.load(content);
                    promise.thenLoad = function(content) {
                        this.then(function(accept, reject) {
                            return _loader.load(content);
                        });
                    };
                    return promise;
                }
            } else if (Array.isArray(content)) {
                var promises = content.map(function(value) {
                    return _loader.load(value);
                });
                return Promise.all(promises).then(function(assets) {
                    var ret = {};

                    assets.forEach(function(value) {
                        if (typeof ret[value.type] == "undefined") {
                            ret[value.type] = {};
                        }

                        if (value.type === "model" || value.type === "cubemap") {
                            ret[value.type][value.name] = value;
                        } else if (value.type === "glsl") {
                            Object.keys(value).forEach(function(key) {
                                if (key === "type")
                                    return;
                                ret.glsl[key] = value[key];
                            });
                        }
                    });

                    return ret;
                });
            }
        }
    }

    var proto = {

    };

    _loader.load = loader.load;
    return _loader;
})(loader || {});
