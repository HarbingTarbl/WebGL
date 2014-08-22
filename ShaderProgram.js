"use strict";

function ShaderProgram(args) { 
    this.valid = false;

    var vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, args.vertex);
    gl.compileShader(vertex);
    if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
        console.log("could not compile vertex shader : " + args.vertex + " : " +  gl.getShaderInfoLog(vertex));
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
        for (var i in args.binds) {
            var bind = args.binds[i];
            gl.bindAttribLocation(this.program, bind[1], bind[0]);
        }
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
  
        switch (uniform.type) {
            case gl.FLOAT_MAT4:
                Object.defineProperty(this.uniform, uniform.name, function(a) {
                    return {
                        set: function(v) {
                            gl.uniformMatrix4fv(a.location, false, v);
                        },
                        get: function() {
                            return "mat4";
                        }
                    };
                }(uniform));
                break;
            case gl.FLOAT_MAT3:
                Object.defineProperty(this.uniform, uniform.name, function(a){
                    return {
                        set: function(v) {
                            gl.uniformMatrix3fv(a.location, false, v);
                        },
                        get: function() {
                            return "mat3";
                        }
                    };
                }(uniform));
                break;
            case gl.FLOAT_MAT2:
                Object.defineProperty(this.uniform, uniform.name, function(a){
                    return {
                        set: function(v) {
                            gl.uniformMatrix2fv(a.location, false, v);
                        },
                        get: function() {
                            return "mat2";
                        }
                    };
                }(uniform));
                break;
            case gl.FLOAT_VEC4:
                Object.defineProperty(this.uniform, uniform.name, function(a){
                    return {
                        set: function(v){
                            gl.uniform4fv(a.location, v);
                        },
                        get: function() {
                            return "vec4";
                        }
                    };
                }(uniform));
                break;
            case gl.FLOAT_VEC3:
                Object.defineProperty(this.uniform, uniform.name, function(a){
                    return {
                        set: function(v){
                            gl.uniform3fv(a.location, v);
                        },
                        get: function() {
                            return "vec3";
                        }
                    };
                }(uniform));
                break;
            case gl.FLOAT_VEC2:
                Object.defineProperty(this.uniform, uniform.name, function(a){
                    return {
                        set: function(v){
                            gl.uniform2fv(a.location, v);
                        },
                        get: function() {
                            return "vec2";
                        }
                    };
                }(uniform));
                break;
            case gl.FLOAT:
                Object.defineProperty(this.uniform, uniform.name, function(a){
                    return {
                        set: function(v){
                            gl.uniform1f(a.location, v);
                        },
                        get: function() {
                            return "float";
                        }
                    };
                }(uniform));
                break;

            case gl.SAMPLER_2D:
                gl.uniform1i(uniform.location, cTeId);  
                Object.defineProperty(this.sampler, uniform.name, function(a){
                    return {
                        set: function(v){
                            gl.activeTexture(gl.TEXTURE0 + a);
                            gl.bindTexture(gl.TEXTURE_2D, v);
                        },
                        get: function(){
                            return "sampler2D";
                        }
                    };
                }(cTeId++));
                break;
        }
    }

    Object.freeze(this.uniform);
    Object.freeze(this.sampler);

    gl.useProgram(null);

    this.use = function () {
        gl.useProgram(this.program);
    }
}
