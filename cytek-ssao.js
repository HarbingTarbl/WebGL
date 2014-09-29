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









};

crytekSSAO.prototype.apply = function(){

};
