var scene = (function(scene) {
    "use strict";

    var createShadowFB = function(size){
    	return env.createFramebuffer(function(fb){
    		var fobj = {
    			id: fb,
    			use: function(){
    				gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
    				gl.viewport(0, 0, size, size);
    				gl.colorMask(true, true, true, true);
    				gl.depthMask(true);
    			}
    		};

    		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    		var makeTex = function(attach, type, format){
    			var setupTex = function(texId){
    				gl.bindTexture(gl.TEXTURE_2D, texId);
    				gl.texImage2D(gl.TEXTURE_2D, 0, format, size, size, 0, format, type, null);
    				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    				return texId;
    			};

    			return function(texId) {
    				var texObj = setupTex(texId);
    				gl.framebufferTexture2D(gl.FRAMEBUFFER, attach, gl.TEXTURE_2D, texId, 0);
    				gl.bindTexture(gl.TEXTURE_2D, null);
    				return texObj;
    			};
    		};

    		fobj.ctex = env.createTexture(makeTex(gl.COLOR_ATTACHMENT0, gl.UNSIGNED_BYTE, gl.RGB));
    		fobj.dtex = env.createTexture(makeTex(gl.DEPTH_ATTACHMENT, gl.UNSIGNED_INT, gl.DEPTH_COMPONENT));
    		var complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    		if(complete != gl.FRAMEBUFFER_COMPLETE)
    			console.log("Shadow Framebuffer Incomplete");

    		return fobj;
    	});
    };

    var createReflectionFB = function(size){
    	return env.createFramebuffer(function(fb){
    		var fobj = {
    			id: fb,
    			use: function(){
    				gl.bindFramebuffer(gl.FRAMEBUFFER, this.id),
    				gl.viewport(0, 0, size, size);
    				gl.colorMask(true, true, true, true);
    				gl.depthMask(true);
    			}
    		};

    		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    		var makeTex = function(attach, type, format){
    			var setupTex = function(texId){
    				gl.bindTexture(gl.TEXTURE_2D, texId);
    				gl.texImage2D(gl.TEXTURE_2D, 0, format, size, size, 0, format, type, null);
    				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    				return texId;
    			};

    			return function(texId) {
    				var texObj = setupTex(texId);
    				gl.framebufferTexture2D(gl.FRAMEBUFFER, attach, gl.TEXTURE_2D, texId, 0);
    				gl.bindTexture(gl.TEXTURE_2D, null);
    				return texObj;
    			};
    		};

    		return fobj;
    	});
    };

    var cache = {
    	t_mat2d : mat2d.create(),
    	t_mat3 : mat3.create(),
    	t_mat4 : mat4.create(),


    	zero: vec3.fromValues(0,0,0),
    	up: vec3.fromValues(0, 1, 0),

    	screenTexel : vec2.fromValues(2.0 / 2048, 2.0 / 2048.0),
    	depthTextureRect : {
    		center: vec2.fromValues(1536, 0),
    		size: vec2.fromValues(512, 512)
    	},
    };

    var quad = function(){
    	var verts = new Float32Array([
    		1, 1, 
    		0, 1,
    		1, 0,
    		0, 0]);

    	var buf = env.createBuffer(function(bufId){
    		gl.bindBuffer(gl.ARRAY_BUFFER, bufId);
    		gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    		gl.bindBuffer(gl.ARRAY_BUFFER, null);
    		return bufId;
    	});

    	var quadObj = {
    		id: buf,
    		draw: function(){
	    		gl.bindBuffer(gl.ARRAY_BUFFER, this.id);
	    		gl.enableVertexAttribArray(0);
	    		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	    		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    		}
    	};

    	return quadObj;
    };

    var loaded = function(assets) {
        window.scene = this;
        scene = this;

        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);

        canvas.width = 2048;
        canvas.height = 2048;


        this.camera = cameras.turnstile.create(75 * 3.14 / 180, env.canvas.clientWidth / env.canvas.clientHeight, 0.1, 100);
        this.camera.distance = [0, 0, 3];
        this.camera.verticalAngle = 45 / 180 * 3.14;

        this.shadowFB = createShadowFB(2048);
        console.log(assets);
        this.models = {
        	quad: quad(),
        	plane: assets.model.plane,
        };

        var fixUpShader = function(shader){
        	var use = shader.use.bind(shader);
        	shader.use = function(){
        		scene.activeShader = this;
        		use();
        	};
        	return shader;
        }

        this.shaders = {
        	quad: fixUpShader(assets.glsl.shadows.createProgram("DrawTQuad.Vertex", "DrawTQuad.Frag")),
        	model: fixUpShader(assets.glsl.shadows.createProgram("DrawModel.Vertex", "DrawModel.Frag")),
        	createShadow: fixUpShader(assets.glsl.shadows.createProgram("CreateShadow.Vertex", "CreateShadow.Frag")),
        };

        this.mouse = {
            left: {
                active: false,
                down: vec2.create(),
                up: vec2.create(),
            },

            right: {
                active: false,
                down: vec2.create(),
                up: vec2.create(),
            },

            position: vec2.create(),
            movement: vec2.create(),
        };

        this.lightPosition = vec3.fromValues(200, 300, 100);
        this.lightTarget = vec3.fromValues(0,0,0);
        this.lightView = mat4.create();
        this.lightProjection = mat4.ortho(mat4.create(), -2, 2, -2, 2, 300, 400);
        this.lightViewProjection = mat4.create();
        this.lightIViewProjection = mat4.create();

        this.mode = 0;

        this.frame = {
            count: 0,
            lastTime: null,
            time: null,
            rate: 0,
            timeDelta: 0
        };

        window.addEventListener('mousedown', this.mousedown.bind(this, this.mouse), false);
        window.addEventListener('mouseup', this.mouseup.bind(this, this.mouse), false);
        window.addEventListener('mousemove', this.mousemove.bind(this, this.mouse), false);

        this.update = this.update.bind(this, this.frame);
        window.requestAnimationFrame(this.update);
    };

    var potato = {
        update: function(frame, time) {
            frame.time = time;
            frame.count += 1;
            frame.timeDelta = (frame.time - frame.lastTime) / 1000.0;
            frame.rate = frame.count / frame.time;
            frame.lastTime = time;

            if (this.mouse.left.active) {
                this.camera.horizontalAngle += frame.timeDelta * this.mouse.movement[0] / 5;
                this.camera.verticalAngle += frame.timeDelta * this.mouse.movement[1] / 4;
            }

            this.camera.update();
            vec3.rotateY(this.lightPosition, this.lightPosition, cache.zero, 0.1);
            mat4.lookAt(this.lightView, this.lightPosition, this.lightTarget, cache.up);
            mat4.mul(this.lightViewProjection, this.lightProjection, this.lightView);
            mat4.invert(this.lightIViewProjection, this.lightViewProjection);

            scene.draw();

            window.requestAnimationFrame(this.update);
        },
        draw: function(){
        	var model = scene.models.plane;
        	var shader;
        	var modelMatrix = mat4.create();
        	var modelMatrix2 = mat4.create();
        	mat4.scale(modelMatrix2, modelMatrix2, vec3.fromValues(0.5, 0.5, 0.5));
        	mat4.translate(modelMatrix2, modelMatrix2, vec3.fromValues(0, 1, 0));

        	model.BindBuffers();

        	scene.shadowFB.use();
        	gl.clear(gl.DEPTH_BUFFER_BIT);
        	shader = scene.shaders.createShadow;
        	shader.use();
        	shader.uniform.uViewProjection = scene.lightViewProjection;
        	scene.drawModel(shader, model, modelMatrix);
        	scene.drawModel(shader, model, modelMatrix2);


        	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        	gl.colorMask(true, true, true, true);
        	gl.depthMask(true);
        	gl.viewport(0, 0, canvas.width, canvas.height);
        	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        	shader = scene.shaders.model;
        	shader.use();
        	shader.uniform.uViewProjection = scene.camera.cameraMatrix;
        	shader.uniform.uLightIViewProjection = scene.lightIViewProjection;
        	shader.uniform.uLightViewProjection = scene.lightViewProjection;
        	shader.uniform.uLightPosition = scene.lightPosition;
        	shader.sampler.sShadow = scene.shadowFB.dtex;

        	scene.drawModel(shader, model, modelMatrix);
        	scene.drawModel(shader, model, modelMatrix2);

        	scene.drawTexturedQuad(cache.depthTextureRect, scene.shadowFB.dtex);

        },
        drawModel: function(shader, model, matrix){
        	Object.keys(model.objects).forEach(function(key){
        		var object = this[key];
        		mat4.mul(cache.t_mat4, matrix, object.transform);
        		shader.uniform.uModel = cache.t_mat4;
        		object.meshes.forEach(function(mesh){
        			shader.sampler.sDiffuse = mesh.material.textures.diffuse;
        			mesh.Draw();
        		});
        	}, model.objects);
        },
        drawTexturedQuad : function(rect, texture){
        	scene.shaders.quad.use();
        	scene.shaders.quad.sampler.sTexture = texture;   
        	scene.shaders.quad.uniform.uScreen = cache.screenTexel;
        	scene.shaders.quad.uniform.uScale = rect.size;
        	scene.shaders.quad.uniform.uPosition = rect.center;

        	scene.models.quad.draw();
        },
        mousedown: function(mouse, e) {
            switch (e.button) {
                case 0:
                    mouse.left.active = true;
                    vec2.set(mouse.left.down, e.clientX, e.clientY);
                    break;
                case 2:
                    mouse.right.active = true;
                    vec2.set(mouse.right.down, e.clientX, e.clientY);
                    break;
            }
            this.mousemove(this.mouse, e);
        },
        mouseup: function(mouse, e) {
            switch (e.button) {
                case 0:
                    mouse.left.active = false;
                    vec2.set(mouse.left.up, e.clientX, e.clientY);
                    break;
                case 2:
                    mouse.right.active = false;
                    vec2.set(mouse.right.up, e.clientX, e.clientY);
                    break;
            }
            this.mousemove(this.mouse, e);
        },
        mousemove: function(mouse, e) {
            vec2.set(mouse.movement, e.clientX - mouse.position[0], e.clientY - mouse.position[1]);
            vec2.set(mouse.position, e.clientX, e.clientY);
        }
    };

    return {
        onload: function() {
            loader.load([
                "assets/plane/plane.model",
                "shadows.glsl",
            ]).then(loaded.bind(Object.create(potato))).catch(function(a) {
                var err = a.stack;
                console.log(err);
                console.log("%cError during init loading creation\n" + a.fileName + " " + a.lineNumber + " " + a, "color:red");
            });
        }
    };
})(scene || {});
