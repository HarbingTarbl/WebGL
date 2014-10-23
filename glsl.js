"use strict"
var loader = (function(loader) {
    var watchDog = 20;

    var patchInclude = function(map, section) {
        if (watchDog === 0) {
            console.log("Recursion too deep could not load ", section.title);
            return;
        }

        watchDog -= 1;
        section.source = section.includes.reduce(function(source, include) {
            if (typeof map[include] === "undefined") {
                console.log("Unknown section ", include);
            } else {
                var target = map[include];
                if (target.needsPatching) {
                    patchInclude(map, target);
                }
                source = target.source + "\n" + source;
            }
            return source;
        }, section.source);

        section.needsPatching = false;
        watchDog += 1;
        return section;
    };

    var patchIncludes = function(sectionMap) {
        Object.keys(sectionMap).forEach(function(key) {
            patchInclude(sectionMap, sectionMap[key]);
        });
        return sectionMap;
    };

    var parseGroups = function(source) {
        var parseSection = function(source) {
            var source = source.split("\n").map(function(str) {
                return str.trim();
            }).filter(function(str) {
                if (str.length === 0)
                    return false;
                return true;
            });

            if (source.length < 2) {
                console.log("Malformed source group?");
                return false;
            }

            var title = source.shift();

            var parts = source.reduce(function(obj, current) {
                if (current == "")
                    return obj;

                if (current.indexOf("#include") === 0) {
                    obj.includes.push(current.split("#include ")[1]);
                } else {
                    obj.source += current + "\n";
                }

                return obj;
            }, {
                includes: [],
                source: "",
            });

            return {
                title: title,
                includes: parts.includes,
                needsPatching: parts.includes.length > 0,
                source: parts.source
            };
        }

        return source.split("---").map(parseSection).reduce(function(obj, v) {
            if (v) {
                obj[v.title] = v;
            }
            return obj;
        }, {});
    };
    var createShader = function(type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log("could not compile shader : \n" + source + "\n : " + gl.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };
    var createProgram = function(vertex, fragment, binds) {
        var program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);

        binds.forEach(function(bind) {
            gl.bindAttribLocation(program, bind[1], bind[0])
        });

        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log("could not link program : \n" + gl.getProgramInfoLog(program));
            return false;
        }

        return program;
    };

    var uniformPropertyGenerators = {};

    uniformPropertyGenerators[gl.FLOAT_MAT4] = function(location) {
        return {
            set: function(v) {
                gl.uniformMatrix4fv(location, false, v);
            }
        };
    };
    uniformPropertyGenerators[gl.FLOAT_MAT3] = function(location) {
        return {
            set: function(v) {
                gl.uniformMatrix3fv(location, false, v);
            }
        };
    };
    uniformPropertyGenerators[gl.FLOAT_MAT2] = function(location) {
        return {
            set: function(v) {
                gl.uniformMatrix2fv(location, false, v);
            }
        };
    };
    uniformPropertyGenerators[gl.FLOAT_VEC4] = function(location) {
        return {
            set: function(v) {
                gl.uniform4fv(location, v);
            }
        };
    };
    uniformPropertyGenerators[gl.FLOAT_VEC3] = function(location) {
        return {
            set: function(v) {
                gl.uniform3fv(location, v);
            }
        };
    };
    uniformPropertyGenerators[gl.FLOAT_VEC2] = function(location) {
        return {
            set: function(v) {
                gl.uniform2fv(location, v);
            }
        };
    };
    uniformPropertyGenerators[gl.FLOAT] = function(location) {
        return {
            set: function(v) {
                gl.uniform1fv(location, v);
            }
        };
    };
    uniformPropertyGenerators[gl.INT] = function(location) {
        return {
            set: function(v) {
                gl.uniform1iv(location, v);
            }
        };
    };
    uniformPropertyGenerators[gl.SAMPLER_2D] = function(textureSlot) {
        return {
            set: function(v) {
                gl.activeTexture(gl.TEXTURE0 + textureSlot);
                gl.bindTexture(gl.TEXTURE_2D, v);
            }
        }
    };
    uniformPropertyGenerators[gl.SAMPLER_CUBE] = function(textureSlot) {
        return {
            set: function(v) {
                gl.activeTexture(gl.TEXTURE0 + textureSlot);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, v);
            }
        }
    };


    var uniformProperties = function(program) {
        var uniforms = {};
        var samplers = {};
        var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        var currentTextureId = 0;
        gl.useProgram(program);

        for (var i = 0; i < count; i++) {
            var uniform = gl.getActiveUniform(program, i);
            uniform.location = gl.getUniformLocation(program, uniform.name);
            var realName = uniform.name;
            if (uniform.name.indexOf("[") != -1) {
                realName = uniform.name.substr(0, uniform.name.indexOf("["));
            }
            var gen = uniformPropertyGenerators[uniform.type];

            switch (uniform.type) {
                case gl.FLOAT_MAT4:
                case gl.FLOAT_MAT3:
                case gl.FLOAT_MAT2:
                case gl.FLOAT_VEC4:
                case gl.FLOAT_VEC3:
                case gl.FLOAT_VEC2:
                case gl.FLOAT:
                case gl.INT:
                    uniforms[realName] = gen(uniform.location);
                    break;
                case gl.SAMPLER_2D:
                    gl.uniform1i(uniform.location, currentTextureId);
                    samplers[realName] = gen(currentTextureId++);
                    break;
                case gl.SAMPLER_CUBE:
                    gl.uniform1i(uniform.location, currentTextureId);
                    samplers[realName] = gen(currentTextureId++);
                    break;
            }
        }
        gl.useProgram(null);
        return {
            uniform: Object.create({}, uniforms),
            sampler: Object.create({}, samplers)
        };
    };

    loader.parseGroup = parseGroups;
    var globalBindings = [
        ["aPosition", 0],
        ["aNormal", 1],
        ["aTangent", 2],
        ["aBitangent", 3],
        ["aTexture", 4]
    ];

    //10 - > k - > i - > 10 - > i - > k - > 10
    var glsl = {
        load: function(path) {
            var promise = new Promise(function(accept, reject) {
                var name = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
                var req = new XMLHttpRequest();
                req.open('GET', path, true);
                req.overrideMimeType('text/plain; charset=x-user-defined');
                req.responseType = "text";
                req.onload = function(e) {
                    var text = req.responseText;
                    var groups = patchIncludes(parseGroups(text));

                    var sources = Object.assign(Object.create(sourcesProto), {
                        groups: groups,
                        name: name,
                        type: "glsl"
                    });

                    accept(sources);
                    console.log(sources);
                };

                req.send();
            });
            return promise;
        }
    };


    var programProto = {
        use: function() {
            gl.useProgram(this.id);
            env.program = this;
        }
    };

    var sourcesProto = {
        createProgram: function(vertex, fragment) {
            if (typeof this.groups[vertex] === "undefined" || typeof this.groups[fragment] === "undefined") {
                console.log("Unknown vertex or fragment group ", vertex, fragment);
                return false;
            }


            vertex = createShader(gl.VERTEX_SHADER, this.groups[vertex].source);
            if (vertex === false)
                return false;

            fragment = createShader(gl.FRAGMENT_SHADER, this.groups[fragment].source);
            if (fragment === false)
                return false;

            var program = createProgram(vertex, fragment, globalBindings);
            var programUniforms = uniformProperties(program);
            return Object.assign(Object.create(programProto), {
                id: program,
                uniform: programUniforms.uniform,
                sampler: programUniforms.sampler,
            });
        },
        setDefine: function(name, value) {

        },
        getDefine: function(name, value) {

        }
    };

    loader.glsl = glsl;

    return loader;

})(loader || {});
