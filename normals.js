"use strict"
var scene = (function(scene) {
    var clickWithin = function(x, y, e) {
        e = e.getBoundingClientRect();
        return !((x < e.left) || (y < e.top) || (x > (e.right)) || (y > (e.bottom)));
    };


    var setupInput = function() {
        var normalsMode_input = document.querySelector("#normalsMode-input");
        console.log(normalsMode_input);
        var activateChildOption = function(option) {
            var childOptions = document.querySelectorAll("#options div.hidden_option");
            Array.prototype.forEach.call(childOptions, function(child) {
                console.log(child.dataset.tag);
                if (child.dataset.tag.search(option) != -1) {
                    child.style.visibility = "visible";
                } else {
                    child.style.visibility = "hidden";
                }
            });
        };
        var selectRenderMode = function(e) {
            var children = this.list.children;
            Array.prototype.forEach.call(children, function(child) {
                if (child.value === this.value) {
                    activateChildOption(child.dataset.option);
                    scene.renderType = child.dataset.mode;

                    return false;
                }
            }, this);
        };

        normalsMode_input.addEventListener("input", selectRenderMode, false);
    };



    var loaded = function(assets) {
        window.scene = this;
        scene = this;
        this.options = {};
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        canvas.width = 2048;
        canvas.height = 2048;

        scene.renderType = "drawNoMapping";

        setupInput();
        scene.options_window = document.querySelector("#options");



        this.cube = assets.model.cube;
        this.ico = assets.model.icosphere;

        this.model = this.ico;
        this.camera = cameras.turnstile.create(75 * 3.14 / 180, env.canvas.clientWidth / env.canvas.clientHeight, 0.1, 100);
        this.camera.distance = [0, 0, 3];

        this.noMappingShader = assets.glsl.NoMapping;
        this.normalMappingShader = assets.glsl.NormalMapping;
        this.parallaxMappingShader = assets.glsl.ParallaxMapping;

        this.gbufferPass = {
            init: function() {
                this.framebuffer = gl.createFramebuffer();
                this.normalTexture = gl.createTexture();
                this.albedoTexture = gl.createTexture();
                this.viewDepthTexture = gl.createTexture();
                this.projectionDepthRender = gl.createRenderbuffer();

                gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

                var db = env.glext.draw_buffers;
                gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, canvas.width, canvas.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, db.COLOR_ATTACHMENT0_WEBGL + 0, gl.TEXTURE_2D, this.normalTexture, 0);

                gl.bindTexture(gl.TEXTURE_2D, this.albedoTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, canvas.width, canvas.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, db.COLOR_ATTACHMENT1_WEBGL, gl.TEXTURE_2D, this.albedoTexture, 0);

                gl.bindTexture(gl.TEXTURE_2D, this.viewDepthTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, db.COLOR_ATTACHMENT2_WEBGL, gl.TEXTURE_2D, this.viewDepthTexture, 0);

                gl.bindRenderbuffer(gl.RENDERBUFFER, this.projectionDepthRender);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.projectionDepthRender);

                var err = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                if (err != gl.FRAMEBUFFER_COMPLETE) {
                    console.log("Bad Gbuffer dawg");
                }



                db.drawBuffersWEBGL([
                    db.COLOR_ATTACHMENT0_WEBGL,
                    db.COLOR_ATTACHMENT1_WEBGL,
                    db.COLOR_ATTACHMENT2_WEBGL,
                ]);

                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindRenderbuffer(gl.RENDERBUFFER, null);

                return this;
            },
            begin: function() {
                gl.bindFramebuffer(gl.FRAMEBUFFER, gbufferPass.framebuffer);
                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.CULL_FACE);
            },
            end: function() {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }
        };

        this.gbufferPass.init();



        var nLights = 7;
        this.lights = {
            _raw_PositionBuffer: new Float32Array(nLights * 4),
            _realloc: function(k) {

            },
            created: [],
            ncreated: 0,
            create: function(init, tick) {
                var light = {
                    tick: tick,
                    init: init,
                    upload: (function(i) {
                        return function() {
                            scene.lights._raw_PositionBuffer[i * 4 + 0] = this.position[0];
                            scene.lights._raw_PositionBuffer[i * 4 + 1] = this.position[1];
                            scene.lights._raw_PositionBuffer[i * 4 + 2] = this.position[2];
                            scene.lights._raw_PositionBuffer[i * 4 + 3] = this.power;
                        };
                    })(this.ncreated),
                    position: vec3.create(),
                    power: 1.0
                };
                this.ncreated += 1;
                this.created.push(light);
                return light.init();
            },
            upload: function(target) {
                this.created.forEach(function(v) {
                    v.upload();
                });
                target.uLights = this._raw_PositionBuffer;
            },
            tick: function() {
                this.created.forEach(function(v) {
                    v.tick();
                });
            }
        };

        (function() {
            var init = function(x, y, z, p) {
                return function() {
                    vec3.set(this.position, x, y, z);
                    this.power = p;
                    return this;
                };
            };
            var rotator = function(func, amount) {
                amount = amount / 180 * 3.14;
                return function() {
                    func(this.position, this.position, env.zero, amount * scene.frame.timeDelta);
                }
            };
            var chain = function() {
                args = Array.apply(null, arguments);
                return function() {
                    args.forEach(function(v) {
                        v(this.position, this.position, amount);

                    }, this);
                };
            };

            scene.lights.create(init(0, 5, 0, 1), rotator(vec3.rotateX, 30));
            scene.lights.create(init(0, 5, 0, 1), rotator(vec3.rotateZ, 60));
            scene.lights.create(init(0, -5, 0, 1), rotator(vec3.rotateX, 60));
            scene.lights.create(init(5, 0, 0, 1), rotator(vec3.rotateY, 60));
            scene.lights.create(init(0, 3, 1, 1), rotator(vec3.rotateX, 60));
            scene.lights.create(init(0, 5, 3, 1), rotator(vec3.rotateZ, 60));
            scene.lights.create(init(9, 5, 9, 1), rotator(vec3.rotateY, 60));
            scene.lights.create(init(4, 5, 0, 1), rotator(vec3.rotateX, 60));
        })();
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

        this.draw = this.draw.bind(this, this.frame);
        window.requestAnimationFrame(this.draw);
    };

    var potato = {
        draw: function(frame, time) {
            frame.time = time;
            frame.count += 1;
            frame.timeDelta = (frame.time - frame.lastTime) / 1000.0;
            frame.rate = frame.count / frame.time;
            frame.lastTime = time;

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            if (this.mouse.left.active) {
                this.camera.horizontalAngle += frame.timeDelta * this.mouse.movement[0] / 5;
                this.camera.verticalAngle += frame.timeDelta * this.mouse.movement[1] / 4;
            }


            this.lights.tick();
            this.camera.update();

            scene[scene.renderType]();
            window.requestAnimationFrame(this.draw);
        },
        applyCameraToProgram: function(program) {
            program.uniform.uProjectionMatrix = scene.camera.projectionMatrix;
            //program.uniform.uNear = scene.camera.nearDistance;
            //program.uniform.uFar = scene.camera.farDistance;
        },
        applyCameraToObject: function(program, object) {
            program.uniform.uViewModelMatrix = scene.camera.viewModel(object.transform);
            program.uniform.uViewNormalMatrix = scene.camera.viewNormal(object.normalMatrix);
        },
        drawParallaxMapped: function(mesh) {
            var shader = scene.parallaxMappingShader;
            shader.use();

            Object.keys(scene.options).forEach(function(key) {
                if (shader.uniform.hasOwnProperty(key)) {
                    shader.uniform[key] = scene.options[key];
                }
            });
            scene.applyCameraToProgram(shader);
            scene.model.BindBuffers();
            Object.keys(scene.model.objects).forEach(function(key) {
                var object = scene.model.objects[key];
                scene.applyCameraToObject(shader, object);
                object.meshes.forEach(function(mesh) {
                    shader.sampler.sNormalMap = mesh.material.textures.normal2;
                    shader.sampler.sHeightMap = mesh.material.textures.height2;
                    mesh.Draw();
                });
            });
        },
        drawNormalMapped: function(mesh) {
            var shader = scene.normalMappingShader;
            shader.use();
            scene.applyCameraToProgram(shader);
            scene.model.BindBuffers();
            Object.keys(scene.model.objects).forEach(function(key) {
                var object = scene.model.objects[key];
                scene.applyCameraToObject(shader, object);
                object.meshes.forEach(function(mesh) {
                    shader.sampler.sNormalMap = mesh.material.textures.normal2;
                    mesh.Draw();
                });
            });

        },
        drawNoMapping: function(mesh) {
            this.noMappingShader.use();
            this.applyCameraToProgram(scene.noMappingShader);
            scene.model.BindBuffers();
            Object.keys(this.model.objects).forEach(function(key) {
                var object = scene.model.objects[key];
                scene.applyCameraToObject(scene.noMappingShader, object);
                object.meshes.forEach(function(mesh) {
                    mesh.Draw();
                });
            });
        },
        mousedown: function(mouse, e) {
            if (clickWithin(e.clientX, e.clientY, scene.options_window))
                return true;

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
        },
        onInput: function(e) {
            scene.options[e.dataset.uniform] = e.value;
        }
    };

    return {
        onload: function() {
            loader.load([
                "assets/cube/cube.model",
                "normals.glsl",
                "assets/ico/icosphere.model",
            ]).then(loaded.bind(Object.create(potato))).catch(function(a) {
                var err = a.stack;
                console.log(err);
                console.log("%cError during init loading creation\n" + a.fileName + " " + a.lineNumber + " " + a, "color:red");
            });
        }
    };
})(scene || {});
