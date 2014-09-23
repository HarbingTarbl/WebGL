var crytekSSAO = function(program, width, height){
	this.framebuffer = gl.createFramebuffer();
	this.occlusionTexture = gl.createTexture();
	this.width = width;
	this.height = height;
	this.progarm = program;
	this.depthTexture = null;

	gl.bindTexture(gl.TEXTURE_2D, this.occlusionTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.occlusionTexture, 0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);


	this.rotationTexture = gl.createTexture();
	var rotations = new Uint8Array(8 * 8 * 3);
	for(var i = 0; i < 8; i++){
		for(var j = 0; j < 8; j++){
			var a = new Adapter(rotations, 3, i * 8 * 3 + j * 3, 1);
			vec3.set(a, Math.abs(Math.random()), Math.abs(Math.random()), 1.0);
			vec3.normalize(a, a);
		}
	}
	gl.bindTexture(gl.TEXTURE_2D, this.rotationTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 8, 8, 0, gl.RGB, gl.UNSIGNED_BYTE, rotations);
	gl.bindTexture(gl.TEXTURE_2D, null);
};

crytekSSAO.prototype.apply = function(){

};
