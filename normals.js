var scene = (function(scene) {


    var quad = env.createBuffer(function(buf) {
        var instances = [];

        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
            [-1, 1, 0, 1,
                1, 1, 0, 1, -1, -1, 0, 1,
                1, -1, 0, 1
            ]), gl.STATIC_DRAW);

        return extend(Object.create({
            bind: function() {
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.enableVertexAttribArray(0);
                gl.vertexAttribPointer(0, 4, gl.FLOAT, 0, 0);
            },
            draw: function() {
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
            instance: function() {
                var normalMatrix = mat3.create();
                var modelMatrix = mat4.create();
                var position = vec3.create();
                var rotation = quat.create();

                var inst = {
                    parent: this,
                    position: vec3.create(),
                    rotation: quat.create(),
                };

                extend(inst,
                    Object.create({
                        updateNormal: function() {
                            mat3.normalFromMat4(_normalMatrix, _modelMatrix);
                        },
                    }, {
                        modelMatrix: readonly(modelMatrix)
                    }));

                instances.push(inst);
                return isnt;
            },

        }, {
            id: readonly(buf)
        }), {
            instances: instances
        });

    });


    return scene;

})(scene || {});
