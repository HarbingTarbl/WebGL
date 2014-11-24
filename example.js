var scene = (function(scene){
	"use strict";

	var cache = {
		t_invTranMatModel : mat3.create(),
	};

	var potato = {
		init: function(assets){
			this.viewMatrix = mat4.create();
			this.projectionMatrix = mat4.create();
			this.viewProjectionMatrix = mat4.create();
			this.modelMatrix = mat4.create();


			this.program = assets.glsl.example.createProgram("Example.vert", "Example.frag");
			this.planeModel = assets.model.plane;

			return this;
		},
		neededAssets: function(){
			return ["assets/plane/plane.model"];
		},
		drawModel: function(matrix, model){
			this.program.uniform.uModelMatrix = matrix;
			model.draw();
		},
		drawModels: function(matmodel){
			matmodel.forEach(function(val){
				this.drawModel.apply(this, val);
			});
		},
		frame: function(){
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			this.program.use();
			this.planeModel.BindBuffers();
			this.planeModel.Draw();
		},
	};

	var prop = {

	};

	return Object.assign(Object.create(potato, prop), scene);
})(scene || {});