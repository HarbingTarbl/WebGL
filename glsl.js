var loader = (function(loader) {
    "use strict";
    var watchDog = 20;

    var buildSource = function(sectionMap, section, defines) {
        if (watchDog === 0) {
            console.log("Recursion limit reached during section", section);
            return [];
        }

        watchDog -= 1;
        var getInclude = function(source) {
            var i = source.split("#include ");
            if (i.length === 1)
                return false;
            return i[1];
        };


        section = sectionMap[section];
        var source = section.source.reduce(function(acc, source) {
            var inc = getInclude(source);
            if (inc) {
                var t = sectionMap[inc];
                if (typeof t === "undefined") {
                    console.log("Unknown segment include ", inc);
                    return null;
                }
                console.log(inc);
                return acc.concat(buildSource(sectionMap, inc));
            } else {
                return acc.concat(source);
            }

        }, defines || []);
        watchDog += 1;
        return source;
    };

    var parseGroups = function(source) {
        return source.split("---").map(function(source) {
            source = source.split("\n").map(function(str) {
                return str.trim();
            }).filter(function(str) {
                if (str.length === 0)
                    return false;
                return true;
            });

            var title = source.shift();

            return {
                title: title,
                source: source
            };
        }).filter(function(v) {
            return v.source.length >= 2;
        }).reduce(function(obj, v) {
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
            gl.bindAttribLocation(program, bind[1], bind[0]);
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
    uniformPropertyGenerators[gl.FLOAT] = function(location, size) {
        if (size > 1) {
            return {
                set: function(v) {
                    gl.uniform1fv(location, v);
                }
            };
        } else {
            return {
                set: function(v) {
                    gl.uniform1f(location, v);
                }
            };
        }
    };
    uniformPropertyGenerators[gl.INT] = function(location, size) {
        if (size > 1) {
            return {
                set: function(v) {
                    gl.uniform1iv(location, v);
                }
            };
        } else {
            return {
                set: function(v) {
                    gl.uniform1i(location, v);
                }
            };
        }
    };
    uniformPropertyGenerators[gl.SAMPLER_2D] = function(textureSlot) {
        return {
            set: function(v) {
                gl.activeTexture(gl.TEXTURE0 + textureSlot);
                gl.bindTexture(gl.TEXTURE_2D, v);
            }
        };
    };
    uniformPropertyGenerators[gl.SAMPLER_CUBE] = function(textureSlot) {
        return {
            set: function(v) {
                gl.activeTexture(gl.TEXTURE0 + textureSlot);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, v);
            }
        };
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
                    uniforms[realName] = gen(uniform.location, uniform.size);
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
                    var groups = parseGroups(text);

                    var sources = Object.assign(Object.create(sourcesProto), {
                        groups: groups,
                        name: name,
                        type: "glsl",
                        defines: []
                    });

                    accept(sources);
                    console.log(sources);
                };

                req.send();
            });
            return promise;
        }
    };


    var prepend = function(value) {
        return function(str) {
            return value + str;
        };
    };

    var append = function(value) {
        return function(str) {
            return str + value;
        };
    };

    var buildDefine = function(define) {
        if (Array.isArray(define)) {
            if (define[1] === null) {
                return "";
            }
            return define.join(" ");
        }
        return define;
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

            var defines = Object.keys(this.defines).map(function(key) {
                return [key, this.defines[key]];
            }).map(buildDefine);

            var vDefines = ["VERTEX_SHADER true"].concat(defines).map(prepend("#define "));
            var fDefines = ["FRAGMENT_SHADER true"].concat(defines).map(prepend("#define "));


            var program = createProgram(
                createShader(gl.VERTEX_SHADER, buildSource(this.groups, vertex, vDefines).join("\n")),
                createShader(gl.FRAGMENT_SHADER, buildSource(this.groups, fragment, fDefines).join("\n")),
                globalBindings);

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
