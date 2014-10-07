"use strict";
var gl;
var globalGLError;

var brdf = function() {
    var me = {};

    me.canvas = null;
    me.settings = {
        width: 0,
        height: 0
    };

    me.xaxis = vec3.fromValues(1, 0, 0);
    me.yaxis = vec3.fromValues(0, 1, 0);
    me.zaxis = vec3.fromValues(0, 0, 1);

    me.onresize = function() {

    };

    me.startWGL = function(canvas) {
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
        if (gl.ext.depth_texture == null)
            gl.ext.depth_texture = gl.getExtension("WEBGL_depth_texture");
        gl.ext.element_index_uint = gl.getExtension("OES_element_index_uint");


        var scale = window.devicePixelRatio | 1;
        canvas.width = 1024;
        canvas.height = 512;

        console.log(canvas.height);

        this.settings.width = canvas.width;
        this.settings.height = canvas.height;

        var meshes = [
            "models/crytek-sponza/sponza.model"
        ];

        var shaders = [
            "shaders.glsl"
        ];


        var init = function() {
            var pointerLock = 'pointerLockElement' in document ||
                'webkitPointerLockElement' in document ||
                'mozPointerLockElement' in document;

            if (pointerLock) {
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
            } else {
                me.canvas.requestPointerLock = function() {};
                document.exitPointerLock = function() {};
                me.pointerIsLocked = true;
            }




            me.matrices = {};
            me.event = {};
            me.keys = new Int8Array(255);


            var maxPointLights = 5;
            var maxSpotLights = 1;
            var maxDirectionalLights = 1;

            me.lights = {
                _raw_PointLight_Position: new Float32Array(maxPointLights * 3),
                _raw_PointLight_Color: new Float32Array(maxPointLights * 3),
                _raw_PointLight_Radius: new Float32Array(maxPointLights * 1),
                _raw_PointLight_Cutoff: new Float32Array(maxPointLights * 1),
                _raw_PointLight_Power: new Float32Array(maxPointLights * 1),


                _raw_SpotLight_Position: new Float32Array(maxSpotLights * 3),
                _raw_SpotLight_Direction: new Float32Array(maxSpotLights * 3),
                _raw_SpotLight_Color: new Float32Array(maxSpotLights * 3),
                _raw_SpotLight_Angle: new Float32Array(maxSpotLights * 3),
                _raw_SpotLight_Atten: new Float32Array(maxSpotLights * 2),

                _raw_DirectionalLight_Buffer: new Float32Array(maxDirectionalLights * 7),
                _raw_SpotLight_Buffer: new Float32Array(maxSpotLights * 11),

                directional: [],
                spot: [],
                point: [],

                transformDirectional: function(camera, light) {
                    if (light.cached)
                        return;

                    vec3.transformMat4(light._direction, light.direction, camera.view());
                    vec3.normalize(light._direction, light._direction);
                },

                transformSpot: function(camera, light) {
                    if (light.cached)
                        return;

                    vec3.transformMat3(light._direction, light.direction, camera.orientation());
                    vec3.normalize(light._direction, light._direction);

                    vec3.transformMat4(light._position, light.position, camera.view());
                },

                transformPoint: function(camera, light) {
                    if (light.cached)
                        return;

                    vec3.transformMat4(light._position, light.position, camera.view());
                },

                uploadUniforms: function(program, lightGroup) {
                    // program.uniform.uDirectionalLightDirections = lightGroup._raw_Directional_Directions;
                    // program.uniform.uDirectionalLightColors = lightGroup._raw_Directional_Colors;

                    program.uniform.uSpotLightPosition = lightGroup._raw_SpotLight_Position;
                    program.uniform.uSpotLightDirection = lightGroup._raw_SpotLight_Direction;
                    program.uniform.uSpotLightAngle = lightGroup._raw_SpotLight_Angle;
                    program.uniform.uSpotLightColor = lightGroup._raw_SpotLight_Color;
                    program.uniform.uSpotLightAttenuation = lightGroup._raw_SpotLight_Atten;


                    program.uniform.uPointLightPosition = lightGroup._raw_PointLight_Position;
                    program.uniform.uPointLightColor = lightGroup._raw_PointLight_Color;
                    program.uniform.uPointLightRadius = lightGroup._raw_PointLight_Radius;
                    program.uniform.uPointLightCutoff = lightGroup._raw_PointLight_Cutoff;
                    program.uniform.uPointLightPower = lightGroup._raw_PointLight_Power;

                }
            };


            // me.lights.directional = Array.apply(null, Array(brdf.lights._raw_Directional_Directions.length / 3)).map(function(_, i) {
            //     var obj = {
            //         _direction: new Adapter(brdf.lights._raw_Directional_Directions, 3, i * 3, 1),
            //         direction: vec3.create(),
            //         color: new Adapter(brdf.lights._raw_Directional_Colors, 3, i * 4, 1),
            //         cached: false
            //     };

            //     Object.defineProperty(obj, 'power', {
            //         set: function(v) {
            //             brdf.lights._raw_Directional_Colors[i * 4 + 3] = v;
            //         },
            //         get: function() {
            //             return brdf.lights._raw_Directional_Colors[i * 4 + 3];
            //         }
            //     });

            //     return obj;

            // });

            me.lights.point = Array.apply(null, Array(maxPointLights)).map(function(_, i) {
                var posbuffer = brdf.lights._raw_PointLight_Position;
                var colorbuffer = brdf.lights._raw_PointLight_Color;
                var radiusbuffer = brdf.lights._raw_PointLight_Radius;
                var cutoffbuffer = brdf.lights._raw_PointLight_Cutoff;
                var powbuffer = brdf.lights._raw_PointLight_Power;

                var obj = {
                    _position: new Adapter(posbuffer, 3, i * 3, 1),
                    color: new Adapter(colorbuffer, 3, i * 3, 1),
                    position: vec3.create(),
                };

                Object.defineProperty(obj, 'radius', {
                    set: function(v) {
                        radiusbuffer[i] = v;
                    },
                    get: function() {
                        return radiusbuffer[i];
                    }
                });

                Object.defineProperty(obj, 'cutoff', {
                    set: function(v) {
                        cutoffbuffer[i] = v;
                    },
                    get: function() {
                        return cutoffbuffer[i]
                    }
                });

                Object.defineProperty(obj, 'power', {
                    set: function(v) {
                        powbuffer[i] = v;
                    },
                    get: function() {
                        return powbuffer[i];
                    }
                });

                return obj;
            });

            me.lights.spot = Array.apply(null, Array(maxSpotLights)).map(function(_, i) {
                var posbuf = brdf.lights._raw_SpotLight_Position;
                var dirbuf = brdf.lights._raw_SpotLight_Direction;
                var colbuf = brdf.lights._raw_SpotLight_Color;
                var angbuf = brdf.lights._raw_SpotLight_Angle;
                var atnbuf = brdf.lights._raw_SpotLight_Atten;

                var obj = {
                    _position: new Adapter(posbuf, 3, i * 3, 1),
                    _direction: new Adapter(dirbuf, 3, i * 3, 1),
                    color: new Adapter(colbuf, 3, i * 3, 1),
                    position: vec3.create(),
                    direction: vec3.create(),
                };

                Object.defineProperty(obj, 'power', {
                    set: function(v) {
                        angbuf[i * 3 + 2] = v;
                    },
                    get: function() {
                        return andbuf[i * 3 + 2];
                    }
                });

                Object.defineProperty(obj, 'innerAngle', {
                    set: function(v) {
                        angbuf[i * 3 + 1] = v;
                    },
                    get: function() {
                        return angbuf[i * 3 + 1];
                    }
                });

                Object.defineProperty(obj, 'outerAngle', {
                    set: function(v) {
                        angbuf[i * 3 + 0] = v;
                    },
                    get: function() {
                        return angbuf[i * 3 + 0];
                    }
                });

                Object.defineProperty(obj, 'radius', {
                    set: function(v) {
                        atnbuf[i * 2 + 0] = v;
                    },
                    get: function() {
                        return atnbuf[i * 2 + 0];
                    }
                });

                Object.defineProperty(obj, 'cutoff', {
                    set: function(v) {
                        atnbuf[i * 2 + 1] = v;
                    },
                    get: function() {
                        return atnbuf[i * 2 + 1];
                    }
                });

                return obj;
            });


            brdf.lights.point[0].radius = 500;
            brdf.lights.point[0].cutoff = 0.5;
            brdf.lights.point[0].power = 0.0;
            vec3.set(brdf.lights.point[0].color, 1, 1, 1);
            vec3.set(brdf.lights.point[0].position, 0, 100, 0);


            brdf.lights.point[1].power = 0;
            brdf.lights.point[2].power = 0;
            brdf.lights.point[3].power = 0;
            brdf.lights.point[4].power = 0;

            brdf.lights.spot[0].radius = 1200;
            brdf.lights.spot[0].cutoff = 0.3;
            brdf.lights.spot[0].power = 1.0;
            brdf.lights.spot[0].innerAngle = Math.cos(45 / 180 * 3.14);
            brdf.lights.spot[0].outerAngle = Math.cos(80 / 180 * 3.14);
            vec3.set(brdf.lights.spot[0].color, 1, 1, 1);
            vec3.set(brdf.lights.spot[0].position, 200, 400, 0);
            vec3.set(brdf.lights.spot[0].direction, 0, -1, 0);







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
            me.camera.offsetPosition(0, 0, 3);
            me.ssao.camera = me.camera;
            me.ssao.projectionMatrix = me.camera._perspectiveMatrix;

            me.event.mousedown = function(e) {
                me.canvas.requestPointerLock();
                return true;
            };

            me.event.mouseup = function(e) {
                return true;
            };

            me.event.mousemove = function(e) {
                if (me.pointerIsLocked === false) {
                    return true;
                }

                me.camera.offsetPitch(e.movementX / 200.0);
                me.camera.offsetYaw(e.movementY / 200.0);
                return true;
            };

            me.event.pointerLockChange = function(e) {
                if (document.pointerLockElement === me.canvas) {
                    me.pointerIsLocked = true;
                } else {
                    me.pointerIsLocked = false;
                }
                return true;
            };

            me.event.keydown = function(e) {
                this.keys[e.keyCode] = true;

                return true;
            };

            me.event.keyup = function(e) {
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

            var updateSpot = function(light) {
                brdf.lights.transformSpot(brdf.camera, light);
            };

            var updateDirectional = function(light) {
                brdf.lights.transformDirectional(brdf.camera, light);
            };

            var updatePoint = function(light) {
                brdf.lights.transformPoint(brdf.camera, light);
            };

            brdf.camera.updateLights = function() {
                brdf.lights.directional.forEach(updateDirectional, null);
                brdf.lights.spot.forEach(updateSpot, null);
                brdf.lights.point.forEach(updatePoint, null);
            };

            return Promise.all([me.ssao.ready()]);
        };

        ContentLoader.Load(
            [
                ["vPosition", 0],
                ["vNormal", 1],
                ["vTangent", 2],
                ["vBitangent", 3],
                ["vTexture", 4]
            ],
            meshes,
            shaders).then(function(content) {
            for (var x in content) {
                if (content.hasOwnProperty(x)) {
                    me[x] = content[x];
                }
            }
            return Promise.resolve();
        }).then(init).then(me.draw).catch(function(a) {
            var err = a.stack;
            console.log(err);

            console.log("%cError during inital draw call\n" + a.fileName + " " + a.lineNumber + " " + a, "color:red");
        });

        me.drawAxisObject = function(axis) {
            mat4.mul(me.matrices.modelViewProjection, me.matrices.viewProjection, axis.transform);
            axis.UpdateNormal();
            me.activeProgram.uniform.uMVPMatrix = me.matrices.modelViewProjection;
            me.activeProgram.uniform.uNormalMatrix = axis.normalMatrix;
        };

        me.drawAxisMesh = function(mesh) {
            if (typeof mesh.material.textures.diffuse0 === "undefined") {
                return;
            }

            me.activeProgram.sampler.diffuse0 = mesh.material.textures.diffuse0;
            me.activeProgram.sampler.height0 = mesh.material.textures.height0;
        };
    };

    me.draw = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, brdf.settings.width, brdf.settings.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // me.activeProgram = me.program.DLDO;

        if (me.keys[87]) {
            vec3.scaleAndAdd(me.camera.position(), me.camera.position(), me.camera.forward(), 5.0);
        } else if (me.keys[83]) {
            vec3.scaleAndAdd(me.camera.position(), me.camera.position(), me.camera.forward(), -5.0);
        } else if (me.keys[68]) {
            vec3.scaleAndAdd(me.camera.position(), me.camera.position(), me.camera.right(), 5.0);
        } else if (me.keys[65]) {
            vec3.scaleAndAdd(me.camera.position(), me.camera.position(), me.camera.right(), -5.0);
        } else if (me.keys[70]) {
            vec3.scaleAndAdd(me.camera.position(), me.camera.position(), me.camera.up(), -5.0);
        } else if (me.keys[82]) {
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

        pass.drawStart();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        brdf.camera.updateLights();
        brdf.lights.uploadUniforms(pass.program, brdf.lights);

        pass.drawModel(model);



        // pass = brdf.ssao.occlusionPass;
        // pass.apply();

        // pass = brdf.ssao.blurPass;
        // pass.apply(3);




        window.requestAnimationFrame(me.draw);
    };

    me.draw.deltaMove = vec3.create();

    return me;
};

function startWGL(canvas) {
    brdf = new brdf();
    brdf.startWGL(canvas);
}
