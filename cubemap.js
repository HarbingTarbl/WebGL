"use strict"

var loader = (function(loader) {
    var cubemap = {
        load: function(path) {
            var promise = new Promise(function(accept, reject) {
                var dir = path.substr(0, path.lastIndexOf('/') + 1);
                var xhr = new XMLHttpRequest();
                xhr.open('GET', path, true);
                xhr.responseType = 'json';
                xhr.onload = function(e) {
                    var data = this.response;
                    var cubemap = Object.create(proto);
                    var promises = [];
                    var textures = [
                        "+x",
                        "+y",
                        "+z",
                        "-x",
                        "-y",
                        "-z"
                    ].reduce(function(prev, next) {
                        var promise = new Promise(function(a, r) {
                            var img = new Image();
                            img.onload = function() {
                                prev[next] = img;
                                a();
                            };
                            img.onerror = function() {
                                r();
                            };
                            img.src = dir + data[next];
                        });
                        promises.push(promise);
                        return prev;
                    }, {});

                    Promise.all(promises).then(function() {
                        cubemap.init(data.name, textures, data.minfilter, data.magfilter);
                        accept(cubemap);
                    }).catch(function(a) {
                        var err = a.stack;
                        console.log(err);
                        console.log("%cError during cubemap creation\n" + a.fileName + " " + a.lineNumber + " " + a, "color:red");
                    });
                };
                xhr.send();
            });
            return promise;
        }
    };

    var initTexture = function(target, img) {
        switch (target) {
            case "+x":
                target = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
            case "+y":
                target = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
            case "+z":
                target = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
            case "-x":
                target = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
            case "-y":
                target = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
            case "-z":
                target = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
        }

        gl.texImage2D(target, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    };

    var proto = {
        init: function(name, textures, minfilter, magfilter) {
            this.texture = env.createTexture(function(id) {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, id);

                Object.keys(textures).forEach(function(value) {
                    initTexture(value, textures[value]);
                });

                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl[minfilter]);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl[magfilter]);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

                return {
                    id: id,
                    width: textures["+x"].width,
                    height: textures["+x"].width
                };
            });
            this.name = name;
            this.type = "cubemap";
            return this;
        }
    };

    loader.cubemap = cubemap;
    return loader;
})(loader || {});
