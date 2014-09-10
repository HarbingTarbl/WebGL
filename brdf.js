"use strict";
var gl;

var brdf = (function(){
	var me = {};

	me.scene = null;
	me.canvas = null;
	me.passes = {};
	me.settings = {
		width: 0,
		height: 0
	};

	ShaderSource("shaders.glsl", function(sources){
		me.passes.depth = (function(){
			me = {};

			me.program = new ShaderProgram({
				vertex: sources.Depth.vertex,
				fragment: sources.Depth.fragment,
				binds: [
					["vPosition", 0]
				]
			});

			me.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, me.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, brdf.settings.width, brdf.settings.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			//gl.generateMipmap(gl.TEXTURE_2D);

			var wastedMemory = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, wastedMemory);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, brdf.settings.width, brdf.settings.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

			gl.bindTexture(gl.TEXTURE_2D, null);

			brdf.zbuffer = me.texture;

			me.framebuffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, me.framebuffer);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, me.texture, 0);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, wastedMemory, 0);
			var complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			if(complete != gl.FRAMEBUFFER_COMPLETE){
				console.log("Incomplete depth buffer for depth pass");
			}

			me.start = function(){
				gl.depthMask(true);
				gl.enable(gl.DEPTH_TEST);
				gl.enable(gl.CULL_FACE);
				gl.colorMask(false, false, false, false);
				gl.viewport(0, 0, brdf.settings.width, brdf.settings.height);
				gl.bindFramebuffer(gl.FRAMEBUFFER, me.framebuffer);
				me.program.use();
			};

			me.finish = function(){

			};

			return me;
		})();
	});

	me.onresize = function(){

	}

	me.startWGL = function(canvas){
		this.canvas = canvas;
		gl = canvas.getContext("experimental-webgl", {
            antialias: true,
            stencil: false,
            depth: true,
            alpha: false, 
            premultipliedAlpha: false,
            preserveDrawingBuffer: false
        });

        gl.ext = {};
        gl.ext.texture_float = gl.getExtension("OES_texture_float");
        gl.ext.texture_float_linear = gl.getExtension("OES_texture_float_linear");
        gl.ext.standard_derivatives = gl.getExtension("OES_standard_derivatives");
        gl.ext.depth_texture = gl.getExtension("WEBKIT_WEBGL_depth_texture");


 		var scale = window.devicePixelRatio || 1;
    	canvas.width = canvas.clientWidth * scale;
    	canvas.height = canvas.clientHeight * scale;

		this.canvas.onresize = this.onresize;
		this.settings.width = canvas.width;
		this.settings.height = canvas.height;


		delete(this.startWGL);
	}




	return me;
})();


function startWGL(canvas){
	brdf.startWGL(canvas);
}