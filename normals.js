"use strict"

var scene = (function(scene) {
    var bindings = [
        ["vPosition", 0],
        ["vNormal", 1],
        ["vTexture", 4]
    ];

    var models = [];
    var textures = [];
    var shaders = ["normals.glsl"];

    var projectSphere = function(out, point, radius) {
        vec3.set(out, (point[0] - radius / 2) / radius, (point[1] - radius / 2) / radius,
            0.0);

        console.log("Point - ", point);
        console.log("Radius - ", radius);


        //out[1] *= 0;

        var d = vec2.dot(out, out);
        if (d >= 1.0) {
            vec2.normalize(out, out);
        } else {
            out[2] = Math.sqrt(1.0 - d);
        }
        console.log("Out ", out);
    };


    return function() {
        ContentLoader.Load(bindings, models, shaders, textures).then(function(loadedAssets) {
            console.log("KL");
            var quad = env.createBuffer(function(buf) {
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
                    [-1, 1, 0, 1, 1, 1, 0, 1, -1, -1, 0, 1, 1, -1, 0, 1]), gl.STATIC_DRAW);

                return Object.create({
                    bind: function() {
                        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                        gl.enableVertexAttribArray(0);
                        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
                    },
                    draw: function() {
                        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    }
                });
            });

            var scene = window.scene = {};

            scene.programs = loadedAssets.program;
            scene.camera = cameras.arcball.create(75 * 3.14 / 180, canvas.width / canvas.height, 0.1, 30);
            scene.clickState = 0; //0 noclick, 1 clickstarted, 2 noclick->clickstarted 3 clickstarted -> noclick
            scene.mousePos = vec2.create();
            scene.mouseStart = vec2.create();
            scene.activeRotation = quat.create();
            scene.rotationActive = false;


            window.xlock = 1;
            window.ylock = 0;

            window.addEventListener('mousedown', function(e) {
                scene.mouseStart[0] = e.clientX;
                scene.mouseStart[1] = e.clientY;
                scene.rotationActive = true;
            }, false);

            window.addEventListener('mousemove', function(e) {
                vec2.set(scene.mousePos,
                    e.clientX,
                    e.clientY);
            }, false);

            window.addEventListener("mouseup", function(e) {
                scene.rotationActive = false;
            });

            var proj = mat4.create();
            var view = mat4.create();
            var rotation = quat.create();
            var rotationMatrix = mat4.create();
            var rvp = mat4.create();
            mat4.perspective(proj, 75.0 * 3.14 / 180, canvas.width / canvas.height, 0.1, 30);
            mat4.lookAt(view, [0, 0, -3], [0, 0, 0], [0, 1, 0]);


            var draw = function(time) {
                if (scene.rotationActive == 1) {
                    var start = vec3.create();
                    var end = vec3.create();

                    projectSphere(start, scene.mouseStart, 600);
                    projectSphere(end, scene.mousePos, 600);

                    var tempRotation = quat.create();
                    var axis = vec3.cross(vec3.create(), start, end);
                    var angle = (Math.max(0.0, vec3.dot(start, end)));
                    console.log(axis);

                    console.log("Previous Rotation - ", rotation);
                    if (Math.abs(angle) > 0.0) {
                        quat.set(tempRotation, axis[0], axis[1], axis[2], angle);
                        quat.normalize(tempRotation, tempRotation);
                        quat.mul(rotation, tempRotation, rotation);
                    }
                    console.log("Starting - ", start);
                    console.log("Ending - ", end);
                    console.log("Axis - ", axis);
                    console.log("Mouse Start - ", scene.mouseStart);
                    console.log("Mouse End - ", scene.mousePos);
                    console.log("Dot Product - ", angle);
                    console.log("Frame Rotation - ", tempRotation);
                    console.log("Product Rotation - ", rotation);
                    vec2.copy(scene.mouseStart, scene.mousePos);
                }


                var program = scene.programs.blank;
                program.use();

                mat4.fromQuat(rotationMatrix, rotation);
                mat4.mul(rvp, proj, view);
                mat4.mul(rvp, rvp, rotationMatrix);

                program.uniform.uMVP = rvp;


                quad.bind();
                quad.draw();

                window.requestAnimationFrame(draw);
            };

            draw();

            return Promise.resolve();
        }).catch(function(a) {
            var err = a.stack;
            console.log(err);

            console.log("%cError during inital draw call\n" + a.fileName + " " + a.lineNumber + " " + a, "color:red");

        });
    };

})(scene || {});
