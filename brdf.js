"use strict";
var gl;
var globalGLError;


var sponzaDrawHandler = function(){
    this.program = null;
    this.model = null;
};

sponzaDrawHandler.prototype.sponzaDrawObj = function(object){
    mat4.mul(brdf.matrices.modelViewProjection, brdf.matrices.viewProjection, object.Transform);
    brdf.activeProgram.uniform.uMVPMatrix = brdf.matrices.modelViewProjection;
};

sponzaDrawHandler.prototype.sponzaDrawMesh = function(object){
    brdf.activeProgram.sampler.sAlbedo = object.Material.DiffuseTexture;
};

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
            antialias: true,
            stencil: false,
            depth: true,
            alpha: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true
        });

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        //gl.disable(gl.CULL_FACE);
        
        //gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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
        canvas.width = window.screen.width * scale;
        canvas.height = window.screen.height * scale;

        this.canvas.onresize = this.onresize;
        this.settings.width = canvas.width;
        this.settings.height = canvas.height;

        var meshes = [
            "models/soldier.model"
            ];

        var shaders = [
            "shaders.glsl"
            ];

        var init = function(){
            var menu = document.querySelector("#modelMenu");
            for(var meshesModelNameIndex in me.meshes){

            }
            me.matrices = {};
            me.matrices.projection = mat4.create();
            me.matrices.view = mat4.create();
            me.matrices.model = mat4.create();
            me.matrices.normal = mat3.create();
            me.matrices.viewProjection = mat4.create();
            me.matrices.modelViewProjection = mat4.create();
            me.matrices.viewInverse = mat4.create();
            me.matrices.activeView = mat4.create();
            me.matrices.accRotation = mat4.create();
            me.translation = vec3.create();


            me.framebuffer = {};
            me.framebuffer.base = {};
            var base = me.framebuffer.base;


            base.depthTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, base.depthTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, me.canvas.width, me.canvas.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            base.colorTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, base.colorTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, me.canvas.width, me.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            base.normalTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, base.normalTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, me.canvas.width, me.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            base.framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, base.framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, base.colorTexture, 0);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + 1, gl.TEXTURE_2D, base.normalTexture, 0);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, base.depthTexture, 0);

            if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE){
                Error("Bad framebuffer");
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);

            mat4.lookAt(me.matrices.view, [0, 0, 5.0], [0,0,0], [0,1,0]);
            mat4.perspective(me.matrices.projection, 65.0 / 180 * 3.14, canvas.width / canvas.height, 0.01, 20.0);

            me.cameraVAngle = 0;
            me.cameraHAngle = 0;

            me.canvas.mouseState = 0;
            me.canvas.objectRotation = mat4.create();
            me.canvas.onmousedown = function (e) {
                me.canvas.mouseState = 1;
                me.canvas.mouseButton = e.button;
                me.canvas.mouseX = e.clientX;
                me.canvas.mouseY = e.clientY;
                return true;
            };

            window.onmouseup = function (e) {
                me.canvas.mouseState = 0;
                return true;
            };

            me.canvas.onmousemove = function(e){
                if(canvas.mouseState === 0)
                    return true;

                var deltaX = e.clientX - me.canvas.mouseX;
                var deltaY = e.clientY - me.canvas.mouseY;
                me.canvas.mouseX = e.clientX;
                me.canvas.mouseY = e.clientY;

                if(me.canvas.mouseButton === 0){ //Left Click
                    me.cameraVAngle += deltaX / 200.0;
                    me.cameraHAngle += deltaY / 200.0;
                }

                return true;
            };

            me.canvas.oncontextmenu = function(e){
                return ["1"];
            };

            me.canvas.addEventListener("DOMMouseScroll", function(e){
                me.translation[2] += e.detail * 0.1;
            }, false);
            me.canvas.addEventListener("mousewheel", function(e){
                me.translation[2] += e.wheelDelta * 0.001;
            }, false);

            me.activeModel = "soldier";

            return Promise.resolve();
        };

        ContentLoader.Load(
            [["vPosition", 0], ["vNormal", 1], ["vTexture", 4]],
            meshes,
            shaders).then(function(content){
                for(var x in content){
                    if(content.hasOwnProperty(x)){
                        me[x] = content[x];
                    }
                }
                return Promise.resolve();
            }).then(init).then(me.draw).catch(function(a){
                console.log("%cError during inital draw call\n" + a.fileName + " " +  a.lineNumber + " " + a, "color:red");
            });

        me.drawAxisObject = function(axis){
            mat4.mul(me.matrices.modelViewProjection, me.matrices.viewProjection, axis.transform);
            axis.UpdateNormal();
            me.activeProgram.uniform.uMVPMatrix = me.matrices.modelViewProjection;
            me.activeProgram.uniform.uNormalMatrix = axis.normalMatrix;
        };

        me.drawAxisMesh = function(mesh){
            me.activeProgram.uniform.uColor = [1,1,1];
            me.activeProgram.sampler.diffuse0 = mesh.material.textures.diffuse0;
        };

        me.sponzaDraw = new sponzaDrawHandler();
        me.sunDirection = vec3.fromValues(0.57735, 0.57735, 0.57735);
    };

    me.draw = function(){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, brdf.settings.width, brdf.settings.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        me.activeProgram = me.program.DLDO;

        mat4.translate(me.matrices.activeView, me.matrices.view, me.translation);
        mat4.rotateX(me.matrices.activeView, me.matrices.activeView, me.cameraHAngle);
        mat4.rotateY(me.matrices.activeView, me.matrices.activeView, me.cameraVAngle);

        mat4.mul(me.matrices.viewProjection, me.matrices.projection, me.matrices.activeView);

        me.activeProgram.use();
        me.activeProgram.uniform.uLightDirection = me.sunDirection;

        if(me.activeModel != ""){
            var model = me.model[me.activeModel];
            model.BindBuffers();
            model.Draw(me.drawAxisObject, me.drawAxisMesh);
        }
        
        window.requestAnimationFrame(me.draw);
    }

    return me;
};

function startWGL(canvas) {
    brdf = new brdf();
    brdf.startWGL(canvas);
}