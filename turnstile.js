var cameras = (function(cameras) {
    var turnstile = {
        create: function(fov, aspect, near, far) {
            return Object.create(potato).init(fov, aspect, near, far);
        }
    };

    var potato = {
        init: function(fov, aspect, near, far) {
            this.cameraMatrix = mat4.create();
            this.projectionMatrix = mat4.create();
            this.viewMatrix = mat4.create();
            this.viewInverseMatrix = mat4.create();
            this.orientationMatrix = mat3.create();
            this.orientationInverseMatrix = mat3.create();
            this.verticalAngle = 0;
            this.horizontalAngle = 0;
            this.position = vec3.create();
            this.distance = vec3.create();
            this.forward = vec3.create();
            this.right = vec3.create();
            this.up = vec3.create();

            this.viewNormal = mat3.create();
            this.viewModel = mat4.create();

            this.nearDistance = near;
            this.farDistance = far;

            mat4.perspective(this.projectionMatrix, fov, aspect, near, far);
            return this;
        },
        update: function() {
            mat3.identity(this.orientationMatrix);
            mat3.rotateX(this.orientationMatrix, this.orientationMatrix, this.verticalAngle);
            mat3.rotateY(this.orientationMatrix, this.orientationMatrix, this.horizontalAngle);
            mat3.invert(this.orientationInverseMatrix, this.orientationMatrix);
            vec3.transformMat3(this.forward, env.forward, this.orientationInverseMatrix);
            vec3.transformMat3(this.up, env.up, this.orientationInverseMatrix);
            vec3.transformMat3(this.right, env.right, this.orientationInverseMatrix);
            mat4.identity(this.viewMatrix);
            vec3.scale(this.distance, this.distance, -1);
            mat4.translate(this.viewMatrix, this.viewMatrix, this.distance);
            vec3.scale(this.distance, this.distance, -1);
            mat4.mul3(this.viewMatrix, this.viewMatrix, this.orientationMatrix);
            mat4.invert(this.viewInverseMatrix, this.viewMatrix);
            vec3.transformMat4(this.position, env.zero, this.viewInverseMatrix);
            mat4.mul(this.cameraMatrix, this.projectionMatrix, this.viewMatrix);
        },
        viewNormal: function(normal) {
            return mat3.mul(this.viewNormal.this.orientationMatrix, normal);
        },
        viewModel: function(model) {
            return mat4.mul(this.viewModel, this.viewMatrix, model);
        }
    };

    cameras.turnstile = turnstile;
    return cameras;
})(cameras || {});
