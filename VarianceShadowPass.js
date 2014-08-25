/**
 * Created by HarbingTarbl on 8/25/2014.
 */


function VarianceShadowPass(width, height, mipmaps) {
    this.width = width;
    this.height = height;

    this.projectionMatrix = mat4.create();
    mat4.ortho(this.projectionMatrix, -10, 10, -10, 10, 1, 40);
    this.viewMatrix = mat4.create();
    mat4.lookAt(this.viewMatrix, sunDir, [0,0,0], [0,1,0]);
    this.mipmapsEnabled = mipmaps;

    this.shadowProgram = new ShaderProgram(
        {
            vertex: document.getElementById("vsm-shadow-vs").text,
            fragment: document.getElementById("vsm-shadow-fs").text,
            binds: [
                ["vPosition", 0]
            ]
        });

    this.shadowProgram.use();
    this.shadowProgram.uniform.uViewMatrix = this.viewMatrix;
    this.shadowProgram.uniform.uProjectionMatrix = this.projectionMatrix;
    gl.useProgram(null);


    this.framebufferId = gl.createFramebuffer();
    this.depthTextureId = gl.createTexture();
    this.depthRenderBufferId = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderBufferId);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    gl.bindTexture(gl.TEXTURE_2D, this.depthTextureId);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.FLOAT, null);
    if(this.mipmapsEnabled)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    else
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);


    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferId);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.depthTextureId, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthRenderBufferId);

    if (!gl.checkFramebufferStatus(gl.FRAMEBUFFER)) {
        gl.deleteTexture(this.depthTextureId);
        gl.deleteFramebuffer(this.framebufferId);
        console.log("Framebuffer incomplete");
        globalGLError = true;
        return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    this.startShadow = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferId);
        gl.viewport(0, 0, width, height);
        this.shadowProgram.use();
        this.uniform = this.shadowProgram.uniform;
        this.sampler = this.shadowProgram.sampler;
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.draw = function(inst) {
            this.shadowProgram.uniform.uModelMatrix = inst.modelMatrix;
            inst.geo.draw();
        };

        if(this.mipmapsEnabled) {
            this.finish = function () {
                gl.bindTexture(gl.TEXTURE_2D, this.depthTextureId);
                gl.generateMipmap(gl.TEXTURE_2D);
            };
        }
        else {
            this.finish = function(){};
        }
    };
}
