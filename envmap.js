var scene = (function(scene) {
    var loaded = function(assets) {
        window.scene = this;

        var cubeDataSet = document.querySelector("#cubemaps");
        Object.keys(assets.cubemap).forEach(function(key) {
            var option = new Option();
            option.value = key;
            cubeDataSet.appendChild(option);
        });

        var cubemaps = assets.cubemap;

        var cubeInput = document.querySelector("#cubemaps-input");
        cubeInput.addEventListener('input', (function(e) {
            var selectedMap = cubemaps[cubeInput.value];
            if (typeof selectedMap === "undefined") {
                return false;
            }
            if (selectedMap === this.cubemap) {
                return true;
            }
            this.cubemap = selectedMap;
        }).bind(this), false);

        this.simpleShader = assets.glsl.SimpleEnvMap;
        this.skyboxProgram = assets.glsl.Skybox;
        this.cookTorr = assets.glsl.CookTorr;

        this.cube = assets.model.cube;
        this.ico = assets.model.icosphere;
        this.cubemap = assets.cubemap.maskonaive2;

        this.camera = cameras.turnstile.create(75 * 3.14 / 180, env.canvas.width / env.canvas.height, 0.1, 100);
        this.camera.distance = [0, 0, 3];

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

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            if (this.mouse.left.active) {
                this.camera.horizontalAngle += frame.timeDelta * this.mouse.movement[0] / 5;
                this.camera.verticalAngle += frame.timeDelta * this.mouse.movement[1] / 4;
            }

            this.camera.update();
            this.drawSkybox();
            this.drawModel();

            window.requestAnimationFrame(this.draw);
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
        },
        drawCookTorr: function() {
            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(true);
            gl.colorMask(true, true, true, false);

            this.cookTorr.use();
            this.cookTorr.uniform.uVPMatrix = this.camera.cameraMatrix;
            this.cookTorr.uniform.uEye = this.camera.position;
            this.cookTorr.uniform.uLambertCoeff = 1.0;
            this.cookTorr.uniform.uFresnelCoeff = 0.0;
            this.cookTorr.uniform.uSurfaceRoughnessSqr = 1.0;
            this.cookTorr.uniform.uSpecularCoeff = 0.6;
            this.cookTorr.uniform.uSpecularPower = 300;

            this.cookTorr.sampler.sEnvMap = this.cubemap.id;

            this.ico.BindBuffers();
            this.ico.meshes[0].Draw();
        },
        drawModel: function() {
            //gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(true);
            gl.colorMask(true, true, true, false);

            this.simpleShader.use();
            this.simpleShader.uniform.uVPMatrix = this.camera.cameraMatrix;
            this.simpleShader.uniform.uEye = this.camera.position;
            this.simpleShader.sampler.sEnvMap = this.cubemap.id;



            this.ico.BindBuffers();
            this.ico.meshes[0].Draw();
        },

        drawSkybox: function() {
            gl.disable(gl.CULL_FACE);
            gl.disable(gl.DEPTH_TEST);
            gl.depthMask(false);
            gl.colorMask(true, true, true, false);

            this.cube.BindBuffers();
            this.skyboxProgram.use();
            this.skyboxProgram.uniform.uOMatrix = this.camera.orientationMatrix;
            this.skyboxProgram.uniform.uPMatrix = this.camera.projectionMatrix;
            this.skyboxProgram.sampler.sCubeMap = this.cubemap.id;
            this.cube.meshes[0].Draw();
        }
    };

    return {
        onload: function() {
            loader.load([
                "assets/cube/cube.model",
                "envmap.glsl",
                "assets/ico/icosphere.model",
                "assets/maskonaive2.cubemap",
                "assets/skansen2.cubemap",
                "assets/pereabeach2.cubemap",
                "assets/citadella2.cubemap",
            ]).then(loaded.bind(Object.create(potato))).catch(function(a) {
                var err = a.stack;
                console.log(err);
                console.log("%cError during init loading creation\n" + a.fileName + " " + a.lineNumber + " " + a, "color:red");
            });
        }
    };
})(scene || {});
