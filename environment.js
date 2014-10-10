var env = (function(env) {
    var canvas = document.querySelector("canvas");

    var gl = canvas.getContext("experimental-webgl", {
        antialias: false,
        stencil: false,
        depth: true,
        alpha: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false
    });

    var glext = (function(exts) {
        var loaded = {};
        var re = /((?:OES)|(?:WEBKIT_WEBGL)|(?:WEBGL)|(?:ANGLE)|(?:EXT))_(.+)/;
        exts.forEach(function(ext) {
            var extl = gl.getExtension(ext);
            if (extl != null) {
                var m = re.exec(ext);
                if (typeof loaded[m[2]] === "undefined") {
                    loaded[m[2]] = extl;
                }
            }
        });
        return loaded;
    })(["OES_texture_float", "OES_texture_float_linear"]);

    var textures = {};
    var framebuffers = {};
    var buffers = {};
    var renderbuffers = {};

    window.gl = gl;
    window.canvas = canvas;

    return extend(Object.create({
        createTexture: function(func) {
            var texId = gl.createTexture();
            return textures[texId] = func(texId);
        },
        createBuffer: function(func) {
            var bufId = gl.createBuffer();
            return buffers[bufId] = func(bufId);
        },
        createFramebuffer: function(func) {
            var fbId = gl.createFramebuffer();
            return framebuffers[fbId] = func(fbId);
        },
        createRenderbuffer: function(func) {
            var rbId = gl.createRenderbuffer();
            return renderbuffers[rbId] = func(rbId);
        },
        activateProgram: function(program) {

        },
    }, {
        canvas: readonly(canvas),
        gl: readonly(gl),
    }), {
        glext: glext,
        textures: textures,
        framebuffers: framebuffers,
        buffers: buffers,
        renderbuffers: renderbuffers,
    }, env);
})(env || {});
