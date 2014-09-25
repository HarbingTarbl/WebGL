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
        this.startWGL = null;

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
            "models/crytek-sponza/sponza.model"
            ];

        var shaders = [
            "shaders.glsl"
            ];

        var init = function(){

            return Promise.resolve();
        };

        Promise.resolve().then(init).then(me.draw).catch(function(a){
            console.log("%cError during inital draw call\n" + a.fileName + " " +  a.lineNumber + " " + a, "color:red");
        });
    };

    me.draw = function(){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, brdf.settings.width, brdf.settings.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);




        window.requestAnimationFrame(me.draw);
    };


    return me;
};

function startWGL(canvas) {
    brdf = new brdf();
    brdf.startWGL(canvas);
}