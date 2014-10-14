var scene = (function(scene) {
    var loaded = function(assets) {
        window.scene = this;

        this.assets = assets;
        this.simpleShader = assets.glsl.SimpleEnvMap;
        this.cube = assets.model.cube;

        this.camera = cameras.turnstile.create(75 * 3.14 / 180, env.canvas.width / env.canvas.height, 0.1, 100);
        this.camera.position = [0, 0, 5];


        this.draw = Object.getPrototypeOf(this).draw.bind(this);
        window.requestAnimationFrame(this.draw);
    };

    var proto = {
        draw: function(time) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            this.camera.update();

            this.simpleShader.use();
            this.simpleShader.uniform.uMVPMatrix = this.camera.cameraMatrix;

            this.cube.BindBuffers();
            this.cube.Draw();

            window.requestAnimationFrame(this.draw);
        }
    };

    return {
        onload: function() {
            loader.load([
                "assets/cube/cube.model",
                "envmap.glsl",
                "assets/sphere/sphere.model",
                "assets/maskonaive2.cubemap"
            ]).then(loaded.bind(Object.create(proto))).catch(function(a) {
                var err = a.stack;
                console.log(err);
                console.log("%cError during init loading creation\n" + a.fileName + " " + a.lineNumber + " " + a, "color:red");
            });
        }
    };
})(scene || {});
