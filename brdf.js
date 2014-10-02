"use strict";
var gl;
var globalGLError;

var brdf = function () {
    var me = {};

    me.canvas = null;
    me.settings = {
        width: 0,
        height: 0
    };

    me.xaxis = vec3.fromValues(1, 0, 0);
    me.yaxis = vec3.fromValues(0, 1, 0);
    me.zaxis = vec3.fromValues(0, 0, 1);

    me.onresize = function () {

    };

    me.startWGL = function (canvas) {
        delete this.startWGL;

        this.canvas = canvas;
        gl = canvas.getContext("experimental-webgl", {
            antialias: false,
            stencil: false,
            depth: true,
            alpha: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false
        });

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);

        gl.ext = {};
        gl.ext.texture_float = gl.getExtension("OES_texture_float");
        gl.ext.texture_float_linear = gl.getExtension("OES_texture_float_linear");
        gl.ext.standard_derivatives = gl.getExtension("OES_standard_derivatives");
        gl.ext.draw_buffers = gl.getExtension("WEBGL_draw_buffers");
        gl.ext.depth_texture = gl.getExtension("WEBKIT_WEBGL_depth_texture");
        if(gl.ext.depth_texture == null)
            gl.ext.depth_texture = gl.getExtension("WEBGL_depth_texture");
        gl.ext.element_index_uint = gl.getExtension("OES_element_index_uint");


        var scale = window.devicePixelRatio | 1;
        canvas.width = window.screen.width * scale * 0.5;
        canvas.height = window.screen.height * scale * 0.5;

        this.canvas.onresize = this.onresize;
        this.settings.width = canvas.width;
        this.settings.height = canvas.height;

        var meshes = [
            "models/crytek-sponza/sponza.model"
            ];

        var shaders = [
            "shaders.glsl"
            ];


        var init = function(){
        	var pointerLock = 'pointerLockElement' in document ||
        		'webkitPointerLockElement' in document ||
        		'mozPointerLockElement' in document;

        	if(pointerLock){
        		me.canvas.requestPointerLock = me.canvas.requestPointerLock ||
        			me.canvas.mozRequestPointerLock ||
        			me.canvas.webkitRequestPointerLock;

                document.pointerLockElement = document.pointerLockElement ||
                    document.mozPointerLockElement ||
                    document.webkitPointerLockElement;

        		document.exitPointerLock = document.exitPointerLock || 
        			document.mozExitPointerLock ||
        			document.webkitExitPointerLock;
        		me.pointerIsLocked = false;
        	}
        	else{
        		me.canvas.requestPointerLock = function(){};
        		document.exitPointerLock = function(){};
        		me.pointerIsLocked = true;
        	}




            me.matrices = {};
            me.event = {};
            me.keys = new Int8Array(255);
            me.lights = [];

            me.lights.push({
                type:"directional",
                direction: vec3.fromValues(1, 1, 1),
                color: vec3.fromValues(1,1,1),
                ambientIntensity : 0.5,
                intensity: 1.0,
            });

            me.lights.forEach(function(val){
                if (val.type === "directional"){
                    vec3.normalize(val.direction, val.direction);
                }
            });


            
            me.matrices.projection = mat4.create();
            me.matrices.view = mat4.create();
            me.matrices.model = mat4.create();
            me.matrices.normal = mat3.create();
            me.matrices.viewProjection = mat4.create();
            me.matrices.modelViewProjection = mat4.create();

            me.camera = new Camera(75, me.canvas.width / me.canvas.height, 20, 2000);
            console.log("K");
            console.log(me.camera._perspectiveMatrix);
            me.ssao = new crytekSSAO(me.settings.width, me.settings.height, 20, 2000);
            me.camera.offsetPosition(0,0,3);
            me.ssao.camera = me.camera;
            me.ssao.projectionMatrix = me.camera._perspectiveMatrix;

            me.event.mousedown  = function(e){
            	me.canvas.requestPointerLock();
            	return true;
            };

            me.event.mouseup = function(e){
            	return true;
            };

            me.event.mousemove = function(e){
            	if(me.pointerIsLocked === false){
            		return true;
            	}

            	me.camera.offsetPitch(e.movementX / 200.0);
            	me.camera.offsetYaw(e.movementY / 200.0);
            	return true;
            };

            me.event.pointerLockChange = function(e){
            	if(document.pointerLockElement === me.canvas){
            		me.pointerIsLocked = true;
            	}
            	else{
            		me.pointerIsLocked = false;
            	}
            	return true;
            };

            me.event.keydown = function(e){
            	this.keys[e.keyCode] = true;

            	return true;
            };

            me.event.keyup = function(e){
            	this.keys[e.keyCode] = false;
            	return true;
            };

            me.canvas.addEventListener('mousedown', me.event.mousedown.bind(me), false);
            me.canvas.addEventListener('mouseup', me.event.mouseup.bind(me), false);
            me.canvas.addEventListener('mousemove', me.event.mousemove.bind(me), false);
            document.addEventListener('keydown', me.event.keydown.bind(me), false);
            document.addEventListener('keyup', me.event.keyup.bind(me), false);

            var pointerLock = me.event.pointerLockChange.bind(me);
            document.addEventListener('pointerlockchange', pointerLock, false);
            document.addEventListener('webkitpointerlockchange', pointerLock, false);
            document.addEventListener('mozpointerlockchange', pointerLock, false);
            return Promise.all([me.ssao.ready()]);
        };

        ContentLoader.Load(
            [["vPosition", 0], 
            ["vNormal", 1], 
            ["vTangent", 2],
            ["vBitangent", 3],
            ["vTexture", 4]],
            meshes,
            shaders).then(function(content){
                for(var x in content){
                    if(content.hasOwnProperty(x)){
                        me[x] = content[x];
                    }
                }
                return Promise.resolve();
            }).then(init).then(me.draw).catch(function(a){
                var err = a.stack;
                console.log(err);

                console.log("%cError during inital draw call\n" + a.fileName + " " +  a.lineNumber + " " + a, "color:red");
            });

        me.drawAxisObject = function(axis){
            mat4.mul(me.matrices.modelViewProjection, me.matrices.viewProjection, axis.transform);
            axis.UpdateNormal();
            me.activeProgram.uniform.uMVPMatrix = me.matrices.modelViewProjection;
            me.activeProgram.uniform.uNormalMatrix = axis.normalMatrix;
        };

        me.drawAxisMesh = function(mesh){
            if(typeof mesh.material.textures.diffuse0 === "undefined") {
                return;
            }

            me.activeProgram.sampler.diffuse0 = mesh.material.textures.diffuse0;
        };
    };

    me.draw = function(){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, brdf.settings.width, brdf.settings.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // me.activeProgram = me.program.DLDO;

        if(me.keys[87]){
        	vec3.scaleAndAdd(me.camera.position(), me.camera.position(), me.camera.forward(), 5.0);
    	}
    	else if(me.keys[83]){
    		vec3.scaleAndAdd(me.camera.position(), me.camera.position(), me.camera.forward(), -5.0);
    	}
    	else if(me.keys[68]){
    		vec3.scaleAndAdd(me.camera.position(), me.camera.position(), me.camera.right(), 5.0);
    	}
    	else if(me.keys[65]){
    		vec3.scaleAndAdd(me.camera.position(), me.camera.position(), me.camera.right(), -5.0);
    	}
    	else if(me.keys[70]){
    		vec3.scaleAndAdd(me.camera.position(), me.camera.position(), me.camera.up(), -5.0);
    	}
    	else if(me.keys[82]){
    		vec3.scaleAndAdd(me.camera.position(), me.camera.position(), me.camera.up(), 5.0);
    	}

    	me.camera.setNeedsUpdate();
        // me.matrices.viewProjection = me.camera.camera();

        // vec3.rotateY(me.lights[0].direction, me.lights[0].direction, [0,0,0], 0.01);

        // me.activeProgram.use();
        // me.activeProgram.uniform.uLightDirection = me.lights[0].direction;
        // me.activeProgram.uniform.uLightColor = me.lights[0].color;
        // me.activeProgram.uniform.uLightIntensity = me.lights[0].intensity;
        // me.activeProgram.uniform.uAmbientIntensity = me.lights[0].ambientIntensity;


        // var model = me.model.sponza;
        // model.BindBuffers();
        // model.Draw(me.drawAxisObject, me.drawAxisMesh);


        var pass = brdf.ssao.gbufferPass;
        var model = me.model.sponza;

        model.BindBuffers();
        pass.drawStart();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        pass.drawModel(model);




        window.requestAnimationFrame(me.draw);
    };

    me.draw.deltaMove = vec3.create();

    return me;
};

function startWGL(canvas) {
    brdf = new brdf();
    brdf.startWGL(canvas);
}