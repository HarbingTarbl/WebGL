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
            antialias: true,
            stencil: false,
            depth: true,
            alpha: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false
        });

        gl.clearColor(0, 0, 0, 1);

        gl.ext = {};
        gl.ext.texture_float = gl.getExtension("OES_texture_float");
        gl.ext.texture_float_linear = gl.getExtension("OES_texture_float_linear");
        gl.ext.standard_derivatives = gl.getExtension("OES_standard_derivatives");
        gl.ext.depth_texture = gl.getExtension("WEBKIT_WEBGL_depth_texture") | gl.getExtension("WEBGL_depth_texture");


        var scale = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * scale;
        canvas.height = canvas.clientHeight * scale;

        this.canvas.onresize = this.onresize;
        this.settings.width = canvas.width;
        this.settings.height = canvas.height;

        var meshes = ["models/axisarrows/axisarrows.model"];
        var shaders = ["shaders.glsl"]

        var init = function(){
            me.matrices = {};
            me.matrices.projection = mat4.create();
            me.matrices.view = mat4.create();
            me.matrices.model = mat4.create();
            me.matrices.normal = mat3.create();
            me.matrices.viewProjection = mat4.create();
            me.matrices.modelViewProjection = mat4.create();
            me.matrices.viewInverse = mat4.create();
            me.matrices.cameraRight = vec4.fromValues(1,0,0,0);
            me.matrices.cameraUp = vec4.fromValues(0,1,0,0);

            mat4.lookAt(me.matrices.view, [0, 0, 20.0], [0,0,0], [0,1,0]);
            mat4.perspective(me.matrices.projection, 65.0 / 180 * 3.14, canvas.width / canvas.height, 5.0, 50.0);

            me.rotatorLeftClick = function(quat){
                mat4.mul(me.matrices.view, me.matrices.view, quat);
            };

            me.rotatorRightClick = function(quat){

            };

            me.rotator = new CameraRotator(
                canvas, 
                me.rotatorLeftClick,
                me.rotatorRightClick);

            me.rotator.enabled = false;


            me.arcball = new ArcballCamera(me.canvas, me.matrices.cameraRight, me.matrices.cameraUp);
            me.arcball.applyRotation = function(rot){
                mat4.mul(me.matrices.view, me.matrices.view, rot);
                mat4.mul(me.matrices.viewProjection, me.matrices.projection, me.matrices.view);
                mat4.invert(me.matrices.viewInverse, me.matrices.view);
                vec4.transformMat4(me.matrices.cameraRight, [1,0,0,0], me.matrices.viewInverse);
                vec4.transformMat4(me.matrices.cameraUp, [0,1,0,0], me.matrices.viewInverse);
            };

            return Promise.resolve();
        };

        ContentLoader.Load(
            [["vPosition", 0], ["vNormal", 1]],
            meshes,
            shaders).then(function(content){
                for(var x in content){
                    if(content.hasOwnProperty(x)){
                        me[x] = content[x];
                    }
                }
                return Promise.resolve();
            }).then(init).then(me.draw).catch(function(a){
                console.log("%cError during inital draw call\n" + a, "color:red");
            });




        me.drawAxisObject = function(axis){
            mat4.mul(me.matrices.modelViewProjection, me.matrices.viewProjection, axis.Transform);
            axis.UpdateNormal();
            me.activeProgram.uniform.uMVPMatrix = me.matrices.modelViewProjection;
            me.activeProgram.uniform.uNormalMatrix = axis.NormalMatrix;
        };

        me.drawAxisMesh = function(mesh){
            me.activeProgram.uniform.uColor = mesh.Material.DiffuseColor;
        };
    };

    me.draw = function(){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, brdf.settings.width, brdf.settings.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        var object = me.model.axisarrows.Objects.Axis;

        me.activeProgram = me.program.DLDO;

        me.model.axisarrows.BindBuffers();
        me.program.DLDO.use();
        me.program.DLDO.uniform.uLightDirection = [0, 0.70710678118, 0.70710678118];
        object.Draw(me.drawAxisObject, me.drawAxisMesh);

        window.requestAnimationFrame(me.draw);
    }

    return me;
};

function startWGL(canvas) {
    brdf = new brdf();
    brdf.startWGL(canvas);
}