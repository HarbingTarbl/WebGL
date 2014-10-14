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
                    var getFaces = function(faces) {
                        var loadFace = function(side) {
                            var promise = new Promise(function(accept, reject) {
                                var img = new Image();
                                img.onload = function() {
                                    var face = {};
                                    face[side] = img;
                                    accept(face);
                                };
                                img.onerror = function() {
                                    reject();
                                };
                                img.src = dir + data[side];
                            });
                            return promise;
                        };
                        return Promise.all(faces.map(loadFace));
                    };

                    var createCubemap = function(textures) {
                        var textures = textures.reduce(function(obj, value) {
                            return Object.assign(obj, value);
                        });

                        console.log(textures);
                        var cubemap = Object.create(proto);
                        cubemap.init(data.name, textures, data.minfilter, data.magfilter);
                        accept(cubemap);
                        return Promise.resolve(cubemap);
                    };

                    getFaces([
                        "+x",
                        "+y",
                        "+z",
                        "-x",
                        "-y",
                        "-z"
                    ]).then(createCubemap).catch(function(a) {
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
                target = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
                break;
            case "+y":
                target = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
                break;
            case "+z":
                target = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
                break;
            case "-x":
                target = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
                break;
            case "-y":
                target = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
                break;
            case "-z":
                target = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
                break;

        }
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(target, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    };

    var proto = {
        init: function(name, textures, minfilter, magfilter) {
            Object.assign(this, env.createTexture(function(id) {
                console.log(id);

                gl.bindTexture(gl.TEXTURE_CUBE_MAP, id);

                Object.keys(textures).forEach(function(value) {
                    initTexture(value, textures[value]);
                });

                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl[minfilter]);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl[magfilter]);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
                console.log(gl.isTexture(id));

                return {
                    id: id,
                    width: textures["+x"].width,
                    height: textures["+x"].width
                };
            }));
            this.name = name;
            this.type = "cubemap";
            return this;
        }
    };

    loader.cubemap = cubemap;
    return loader;
})(loader || {});
