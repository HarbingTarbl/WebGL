/**
 * Created by HarbingTarbl on 8/25/2014.
 */


function DiffuseColorPass(width, height){
    this.diffuseProgram = new ShaderProgram({
        vertex: document.getElementById("diffuse-vs").text,
        fragment: document.getElementById("diffuse-fs").text,
        binds: [
            ["vPosition", 0],
            ["vNormal", 1],
            ["vColor", 2]
        ]
    });


    this.startDiffuse = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, width, height);

        this.diffuseProgram.use();
        this.uniform = this.diffuseProgram.uniform;
        this.sampler = this.diffuseProgram.sampler;

        gl.disable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.draw = function(inst) {
            this.diffuseProgram.uniform.uModelMatrix = inst.modelMatrix;
            this.diffuseProgram.uniform.uNormalMatrix = inst.normalMatrix();
            gl.vertexAttrib4fv(2, inst.color);
            inst.geo.draw();

        };
    }
}
