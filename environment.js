var env = (function(env) {
    var right = vec3.fromValues(1, 0, 0);
    var up = vec3.fromValues(0, 1, 0);
    var forward = vec3.fromValues(0, 0, -1);

    var loadExtensions = function(env, exts) {
        var loaded = {};
        var re = /((?:OES)|(?:WEBKIT_WEBGL)|(?:WEBGL)|(?:ANGLE)|(?:EXT))_(.+)/;
        exts.forEach(function(ext) {
            var extl = env.gl.getExtension(ext);
            if (extl != null) {
                var m = re.exec(ext);
                if (typeof loaded[m[2]] === "undefined") {
                    loaded[m[2]] = extl;
                }
            }
        });
        return loaded;
    };

    var proto = {
        create: function(element) {
            if (typeof element === "string") {
                element = document.querySelector(element);
            }
            this.canvas = element;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            this.gl = this.canvas.getContext("experimental-webgl", {
                antialias: false,
                stencil: false,
                depth: true,
                alpha: false,
                premultipliedAlpha: false,
                preserveDrawingBuffer: false
            });
            this.glext = loadExtensions(this, ["OES_texture_float", "OES_texture_float_linear"]);

            this.textures = {};
            this.framebuffers = {};
            this.buffers = {};
            this.forward = forward;
            this.right = right;
            this.up = up;

            window.gl = this.gl;
            window.env = this.env;
            return this;
        },
        createTexture: function(func) {
            var texId = this.gl.createTexture();
            return this.textures[texId] = func(texId);
        },
        createBuffer: function(func) {
            console.log("K");
            var bufId = this.gl.createBuffer();
            console.log("K");
            return this.buffers[bufId] = func(bufId);
        },
        createFramebuffer: function(func) {
            var fbId = this.gl.createFramebuffer();
            return this.framebuffers[fbId] = func(fbId);
        },
        createRenderbuffer: function(func) {
            var rbId = this.gl.createRenderbuffer();
            return this.renderbuffers[rbId] = func(rbId);
        },
        activateProgram: function(program) {

        },
        setActive: function() {
            window.gl = this.gl;
            window.canvas = this.canvas;
        }
    };
    return Object.create(proto).create("canvas");
})(env || {});
