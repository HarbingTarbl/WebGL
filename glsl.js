"use strict"
var loader = (function(loader) {
    var glsl = {
        globalBindings: [
            ["aPosition", 0],
            ["aNormal", 1],
            ["aBitangent", 2],
            ["aTangent", 3],
            ["aTexture", 4]
        ],

        load: function(path) {
            var promise = new Promise(function(accept, reject) {
                LoadShaders(path, glsl.globalBindings, function(programs) {
                    programs.type = "glsl";
                    accept(programs);
                });
            });
            return promise;
        }
    };

    var proto = {

    };

    loader.glsl = glsl;

    return loader;

})(loader || {});
