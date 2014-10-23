"use strict"
var loader = (function(loader) {
    var watchDog = 20;

    var patchInclude = function(map, section) {
        if (watchDog === 0) {
            console.log("Recursion too deep could not load ", section.title);
            return;
        }

        watchDog -= 1;
        section.includes.reduce(function(prev, include) {
            if (typeof map[include] === "undefined") {
                console.log("Unknown section ", include);
            } else {
                var target = map[include];
                if (target.hasIncludes) {
                    patchInclude(map, target);
                }
                prev = target.source + "\n" + prev;
            }

        }, "\n");
        watchDog += 1;
    };
    var patchIncludes = function(sectionMap) {
        Object.keys(sectionMap).forEach(patchInclude.bind(sectionMap));
    };
    var parseGroups = function(source) {
        var parseSection = function(source) {
            var source = source.split("\n").map(function(str) {
                return str.trim();
            });

            var title = source.shift();

            var parts = source.reduce(function(obj, current) {
                console.log(current);
                if (current.indexOf("#include") === 0) {
                    obj.includes.push(current.split("#include ")[1]);
                } else {
                    obj.source += current;
                }

                return obj;
            }, {
                includes: [],
                source: "",
            });

            return {
                title: title,
                includes: parts.includes,
                hasIncludes: function() {
                    return includes.length === 0;
                },
                source: parts.source
            };
        }

        return source.split("---").map(parseSection).reduce(function(obj, v) {
            obj[v.title] = v;
        }, {});
    };
    var loadGroupFile = function()


    loader.parseGroup = parseGroup();


    //10 - > k - > i - > 10 - > i - > k - > 10
    var glsl = {
        globalBindings: [
            ["aPosition", 0],
            ["aNormal", 1],
            ["aTangent", 2],
            ["aBitangent", 3],
            ["aTexture", 4]
        ],

        load: function(path) {
            var promise = new Promise(function(accept, reject) {
                var req = new XMLHttpRequest('GET', path, true);
                reg.overrideMimeType('text/plain; charset=x-user-defined');
                req.responseType = "text";
                req.onload = function(e) {
                    var text = req.responseText;
                    var groups = patchIncludes(parseGroups(text));

                };


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
