var scene = (function(scene) {
    "use strict";

    var clickWithin = function(x, y, e) {
        e = e.getBoundingClientRect();
        return !((x < e.left) || (y < e.top) || (x > (e.right)) || (y > (e.bottom)));
    };


    var loaded = function(assets) {
        window.scene = this;
        scene = this;

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.STENCIL_TEST);
        gl.clearStencil(0);
        gl.clearDepth(1);
        gl.clearColor(1,1,1,1);

        gl.frontFace(gl.CCW);
        canvas.width = 2048;
        canvas.height = 2048;






        scene.stencilModel = assets.model.teapot;
        scene.drawModel = assets.model.sponza;
        scene.program = assets.glsl.stencil.createProgram("Vertex", "Fragment");


        mat4.translate(scene.stencilModel.objects.teapot.transform, scene.stencilModel.objects.teapot.transform, vec3.fromValues(0, 50, 0));

        scene.options_window = document.querySelector("#options");

        this.camera = cameras.turnstile.create(75 * 3.14 / 180, env.canvas.clientWidth / env.canvas.clientHeight, 10.0, 3000.0);
        this.camera.distance = [0, 0, 300];
        this.camera.verticalAngle = 45 / 180 * 3.14;

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


            gl.depthMask(true);
            gl.colorMask(true, true, true, false);
            gl.stencilMask(true);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);


            if (this.mouse.left.active) {
                this.camera.horizontalAngle += frame.timeDelta * this.mouse.movement[0] / 5;
                this.camera.verticalAngle += frame.timeDelta * this.mouse.movement[1] / 4;
            }

            this.camera.update();

            var program = scene.program;
            var stencilModel = scene.stencilModel;
            var drawModel = scene.drawModel;

            program.use();
            program.uniform.uProjectionViewMatrix = scene.camera.cameraMatrix;

            gl.depthMask(false);
            gl.colorMask(false, false, false, false);
            gl.stencilMask(true);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
            gl.stencilFunc(gl.ALWAYS, 1, 255);

            stencilModel.BindBuffers();
            Object.keys(stencilModel.objects).forEach(function(key){
                var obj = stencilModel.objects[key];

                obj.UpdateNormal();
                program.uniform.uModelMatrix = obj.transform;
                program.uniform.uNormalMatrix = obj.normalMatrix;

                obj.meshes.forEach(function(mesh){
                    if(typeof mesh.material.textures.diffuse !== "undefined"){
                        program.sampler.sDiffuseMap = mesh.material.textures.diffuse;
                    }

                    mesh.Draw();
                });
            });

            gl.depthMask(true);
            gl.colorMask(true, true, true, false);
            gl.stencilMask(false);
            gl.stencilFunc(gl.EQUAL, scene.displayInside, 255);

            drawModel.BindBuffers();
            Object.keys(drawModel.objects).forEach(function(key){
                var obj = drawModel.objects[key];

                obj.UpdateNormal();
                program.uniform.uModelMatrix = obj.transform;
                program.uniform.uNormalMatrix = obj.normalMatrix;

                obj.meshes.forEach(function(mesh){
                    if(typeof mesh.material.textures.diffuse !== "undefined"){
                        program.sampler.sDiffuseMap = mesh.material.textures.diffuse;
                    }
                    mesh.Draw();
                });
            });

            window.requestAnimationFrame(this.draw);
        },
        applyCameraToProgram: function(program) {
            program.uniform.uProjectionViewMatrix = scene.camera.cameraMatrix;
        },
        applyCameraToObject: function(program, object) {
            program.uniform.uModelMatrix = object.transform;
            program.uniform.uNormalMatrix = object.normalMatrix;
        },
        standardDraw: function(shader){
            shader.use();

            shader.uniform.uCameraLocation = scene.camera.position;
            shader.uniform.uLightDir = vec3.normalize(vec3.create(), [3, 1, 1]);

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
                    shader.sampler.sNormalMap = mesh.material.textures.normal;
                    shader.sampler.sHeightMap = mesh.material.textures.height;
                    shader.sampler.sDiffuseMap = mesh.material.textures.diffuse;
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
        }
    };

    return {
        onload: function() {
            loader.load([
                "assets/teapot/teapot.model",
                "assets/crytek-sponza/sponza.model",
                "stencil.glsl",
            ]).then(loaded.bind(Object.create(potato))).catch(function(a) {
                var err = a.stack;
                console.log(err);
                console.log("%cError during init loading creation\n" + a.fileName + " " + a.lineNumber + " " + a, "color:red");
            });
        }
    };
})(scene || {});
