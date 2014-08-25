/**
 * Created by HarbingTarbl on 8/24/2014.
 */

function ShadowMapAdaptiveBiasPass(width, height) {
    this.framebuffer = gl.createFramebuffer();
    this.framebuffer.width = width;
    this.framebuffer.height = height;
    this.framebuffer.use = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0,0,this.framebuffer.width, this.framebuffer.height);
    };

    this.shadowTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);

    this.depthRenderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT32, width, height);

    gl.bindRenderbufferr(gl.RENDERBUFFER, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.shadowTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthRenderbuffer);

    if(!gl.checkFramebufferStatus(gl.FRAMEBUFFER)){
        globalGLError = true;
        gl.deleteTexture(this.shadowTexture);
        gl.deleteFramebuffer(this.framebuffer);
        return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.shadowProgram = new ShaderProgram({
        vertex: document.querySelector("#shadowmap-adaptive-bias-vs").text,
        fragment: document.querySelector("#shadowmap-adaptive-bias-fs").text,
        binds:[
            ["vPosition", 0]
        ]
    });

    this.diffuseProgram = new ShaderProgram({
        vertex: document.querySelector("#shadowmap-adaptive-bias-scene-vs").text,
        fragment: document.querySelector("#shadowmap-adapative-bias-scene-fs").text,
        binds: [
            ["vPosition", 0],
            ["vNormal", 1],
            ["vColor", 2]
        ]
    });




    this.startShadow = function() {
        this.framebuffer.use();
        this.shadowProgram.use();

        this.uniform = this.shadowProgram.uniform;
        this.sampler = this.shadowProgram.sampler;

        this.finish = function() {
            this.uniform = null;
            this.sampler = null;
        };
    };

    this.startDiffuse = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
        this.diffuseProgram.use();

        this.uniform = this.diffuseProgram.uniform;
        this.sampler = this.diffuseProgram.sampler;

        this.finish = function() {
            this.uniform = null;
            this.sampler = null;
        };
    }

}