/**
 * Created by HarbingTarbl on 8/25/2014.
 */

function GaussianBlurPass(width, height, radius, texformat, textype) {
    this.kernelRadius = radius;
    this.framebuffer = gl.createFramebuffer();
    this.framebuffer.width = width;
    this.framebuffer.height = height;
    this.framebuffer.use = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0, 0, width, height);
    };

    var fbF = function() {
        var k = gl.createFramebuffer();
        k.width = width;
        k.height = height;
        k.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, k.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, texformat, width, height, 0, texformat, textype, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


        gl.bindFramebuffer(gl.FRAMEBUFFER, k);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, k.texture, 0);


        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)) {
            k.use = function() {
                gl.bindFramebuffer(gl.FRAMEBUFFER, k);
                gl.viewport(0, 0, width, height);
            }
        } else {
            k = null;
            globalGLError = true;
            console.log("Invalid Gauss Framebuffer");
        }


        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return k;
    };

    this.ping = fbF();
    this.pong = fbF();


    var vSource = document.getElementById("gaussblur-vs").text;
    var fSource = document.getElementById("gaussblur-fs").text;

    this.program = new ShaderProgram({
        vertex: vSource,
        fragment: fSource,
        binds: [
            ["vPosition", 0]
        ]
    });

    this.start = function(){
        this.program.use();
        this.uniform = this.program.uniform;
        this.sampler = this.program.sampler;
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);

        this.blit = function(a) {
            //WebGL lacks actual framebuffer blits. Code that later.
        };

        this.finish = function() {
            this.uniform = null;
            this.sampler = null;
        };
    };

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
