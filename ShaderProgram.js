"use strict"

function LoadShaders(glslPath, bindings, oncomplete) {
    LoadShaderSource(glslPath, function(sources) {
        var programs = {};
        for (var name in sources) {
            if (sources.hasOwnProperty(name)) {
                programs[name] = new ShaderProgram({
                    vertex: sources[name].vertex,
                    fragment: sources[name].fragment,
                    binds: bindings
                }, false); //Change to 'true' to allow mutable. 
            }
        }
        oncomplete(programs);
    });
};

function LoadShaderSource(filename, onload) {
    if (typeof LoadShaderSource.regex === "undefined") {
        LoadShaderSource.regex = /^(?=---(?!.*END)(?:.*START\s(\w+)\s)?).*\n((?:(?!---(?:$|.*END)).*\n)+)/gm;
    }

    $.ajax({
        url: filename,
        success: function(data) {
            var a;
            var b;
            var obj = {}
            data = data.replace(/\r/g, '');

            while ((a = LoadShaderSource.regex.exec(data)) != null && (b = LoadShaderSource.regex.exec(data)) != null) {
                if (a.index === LoadShaderSource.regex.lastIndex || b.index == LoadShaderSource.regex.lastIndex) {
                    LoadShaderSource.regex.lastIndex++;
                }


                obj[a[1]] = {
                    vertex: a[2].trim(),
                    fragment: b[0].replace('---', '').trim()
                };

            }
            onload(obj);
        },
        accepts: "text",
        mimeType: "text/plain",
        dataType: "text",
        contentType: "text/plain"
    });
}

function ShaderProgram(args, mutable) {
    this.valid = false;


    if (typeof mutable === "undefined") {
        mutable = false;
    }


    var vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, args.vertex);
    gl.compileShader(vertex);
    if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
        console.log("could not compile vertex shader : " + args.vertex + " : " + gl.getShaderInfoLog(vertex));
        gl.deleteShader(vertex);
        globalGLError = true;
        return;
    }

    var fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, args.fragment);
    gl.compileShader(fragment);
    if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
        console.log("could not compile fragment shader : " + args.fragment + " : " + gl.getShaderInfoLog(fragment));
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        globalGLError = true;
        return;
    }

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertex);
    gl.attachShader(this.program, fragment);

    if (args.hasOwnProperty("binds")) {
        args.binds.forEach(function(bind) {
            gl.bindAttribLocation(this.program, bind[1], bind[0])
        }, this);
    }

    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.log("could not link program : " + gl.getProgramInfoLog(this.program));
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        gl.deleteShader(this.program);
        globalGLError = true;
        return;
    }

    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    this.valid = true;
    var nuniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    this.uniform = {};
    this.sampler = {};
    var cTeId = 0;

    gl.useProgram(this.program);

    for (var i = 0; i < nuniforms; i++) {
        var uniform = gl.getActiveUniform(this.program, i);
        uniform.location = gl.getUniformLocation(this.program, uniform.name);
        var realName = uniform.name;
        if (uniform.name.indexOf("[") != -1) {
            console.log(uniform.name, uniform);
            realName = uniform.name.substr(0, uniform.name.indexOf("["));
        }

        switch (uniform.type) {
            case gl.FLOAT_MAT4:
                console.log(realName);
                Object.defineProperty(this.uniform, realName, ShaderProgram.prototype._mat4(uniform.location));
                break;
            case gl.FLOAT_MAT3:
                Object.defineProperty(this.uniform, realName, ShaderProgram.prototype._mat3(uniform.location));
                break;
            case gl.FLOAT_MAT2:
                Object.defineProperty(this.uniform, realName, ShaderProgram.prototype._mat2(uniform.location));
                break;
            case gl.FLOAT_VEC4:
                Object.defineProperty(this.uniform, realName, ShaderProgram.prototype._vec4(uniform.location));
                break;
            case gl.FLOAT_VEC3:
                Object.defineProperty(this.uniform, realName, ShaderProgram.prototype._vec3(uniform.location));
                break;
            case gl.FLOAT_VEC2:
                Object.defineProperty(this.uniform, realName, ShaderProgram.prototype._vec2(uniform.location));
                break;
            case gl.FLOAT:
                Object.defineProperty(this.uniform, realName, ShaderProgram.prototype._uniform1f(uniform.location, uniform.size));
                break;
            case gl.INT:
                Object.defineProperty(this.uniform, realName, ShaderProgram.prototype._uniform1i(uniform.location, uniform.size));
                break;
            case gl.SAMPLER_2D:
                gl.uniform1i(uniform.location, cTeId);
                Object.defineProperty(this.sampler, realName, ShaderProgram.prototype._sampler2D(cTeId++));
                break;
        }
    }

    if (mutable === false) {
        //Object.freeze(this.uniform);
        //Object.freeze(this.sampler);
    }

    gl.useProgram(null);

    this.use = function() {
        gl.useProgram(this.program);
    }
};




ShaderProgram.prototype._sampler2D = function(textureId) {
    return {
        set: function(v) {
            gl.activeTexture(gl.TEXTURE0 + textureId);
            gl.bindTexture(gl.TEXTURE_2D, v);
        },
        get: function() {
            return "sampler2D";
        }
    };
};


ShaderProgram.prototype._uniform1f = function(location, size) {
    if (size == 1) {
        return {
            set: function(v) {
                gl.uniform1f(location, v);
            },
            get: function() {
                return "float";
            }
        };
    } else {
        return {
            set: function(v) {
                gl.uniform1fv(location, v);
            },
            get: function() {
                return "float[" + size + "]";
            }
        };
    }
};

ShaderProgram.prototype._uniform1i = function(location, size) {
    if (size == 1) {
        return {
            set: function(v) {
                gl.uniform1i(location, v);
            },
            get: function() {
                return "int";
            }
        };
    } else {
        return {
            set: function(v) {
                gl.uniform1iv(location, v);
            },
            get: function() {
                return "int[" + size + "]";
            }
        };
    }
};


ShaderProgram.prototype._vec2 = function(location) {
    return {
        set: function(v) {
            gl.uniform2fv(location, v);
        },
        get: function() {
            return "vec2";
        }
    };
};

ShaderProgram.prototype._vec3 = function(location) {
    return {
        set: function(v) {
            gl.uniform3fv(location, v);
        },
        get: function() {
            return "vec3";
        }
    };
};

ShaderProgram.prototype._vec4 = function(location) {
    return {
        set: function(v) {
            gl.uniform4fv(location, v);
        },
        get: function() {
            return "vec4";
        }
    };
};

ShaderProgram.prototype._mat2 = function(location) {
    return {
        set: function(v) {
            gl.uniformMatrix2fv(location, false, v);
        },
        get: function() {
            return "mat2";
        }
    };
};

ShaderProgram.prototype._mat3 = function(location) {
    return {
        set: function(v) {
            gl.uniformMatrix3fv(location, false, v);
        },
        get: function() {
            return "mat3";
        }
    };
};

ShaderProgram.prototype._mat4 = function(location) {
    return {
        set: function(v) {
            gl.uniformMatrix4fv(location, false, v);
        },
        get: function() {
            return "mat4";
        }
    };
};


ShaderProgram.prototype.use = function() {
    gl.useProgram(this.program);
};
