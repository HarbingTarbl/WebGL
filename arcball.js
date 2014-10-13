var cameras = (function(cameras) {
    var arcball = {
        create: function(fov, aspect, near, far) {
            return Object.create(proto).create(fov, aspect, near, far);
        }
    };

    var proto = {
        create: function(fov, aspect, near, far) {
            this.viewMat = mat4.create();
            this.orientMat = mat3.create();
            this.orientInvMat = mat3.create();
            this.tempRot = quat.create();
            this.tempMat = mat3.create();
            this.cameraMat = mat4.create();

            this.projMat = mat4.create();
            this.pos = vec3.create();
            this.forward = vec3.create();
            this.up = vec3.create();
            this.right = vec3.create();

            this.startPos = vec3.create();
            this.endPos = vec3.create();
            this.rotAxis = vec3.create();
            mat4.perspective(this.projMat, fov, aspect, near, far);
            return this;
        },
        startRotation: function(start) {
            var dot = vec2.dot(start, start);
            vec3.set(this.startPos, start[0], start[1], 0.0);
            if (dot >= 1.0) {
                vec2.normalize(this.startPos, this.startPos);
            } else {
                this.startPos[2] = Math.sqrt(1.0 - dot);
            }
            this._hasRotation = true;
        },

        updateRotation: function(current) {
            var dot = vec2.dot(current, current);
            vec3.set(this.endPos, current[0], current[1], 0.0);
            if (dot >= 1.0) {
                vec2.normalize(this.endPos, this.endPos);
            } else {
                this.endPos[2] = Math.sqrt(1.0 - dot);
            }
            this._hasRotation = true;

        },
        calcRotation: function(start, end) {
            var start = vec3.fromValues(start[0], start[1], 0.0);
            var end = vec3.fromValues(end[0], end[1], 0.0);
        },
        applyRotation: function() {
            this._needsApplyRotation = true;
        },
        update: function() {

            //mat4.lookAt(this.viewMat, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
            //mat4.mul(this.cameraMat, this.projMat, this.viewMat);
            //return;

            vec3.cross(this.rotAxis, this.startPos, this.endPos);
            var angle = Math.acos(vec3.dot(this.startPos, this.endPos));
            quat.setAxisAngle(this.tempRot, this.rotAxis, angle);

            mat3.fromQuat(this.tempMat, this.tempRot);

            if (this._needsApplyRotation) {
                this._needsApplyRotation = false;
                this._hasRotation = false;
                mat3.mul(this.orientMat, this.orientMat, this.tempMat);
                mat3.identity(this.tempMat);
            } else {

            }

            mat3.mul(this.tempMat, this.orientMat, this.tempMat);
            mat3.invert(this.orientInvMat, this.tempMat);
            vec3.transformMat3(this.forward, env.forward, this.orientInvMat);
            vec3.transformMat3(this.up, env.up, this.orientInvMat);
            vec3.transformMat3(this.right, env.right, this.orientInvMat);

            mat4.identity(this.viewMat);
            this.viewMat[10] = -1;
            mat4.translate(this.viewMat, this.viewMat, [0, 0, 3]);
            mat4.mul3(this.viewMat, this.viewMat, this.tempMat);
            //vec3.negate(this.pos, this.pos);

            //vec3.negate(this.pos, this.pos);

            mat4.mul(this.cameraMat, this.projMat, this.viewMat);
        },
        camera: function() {
            return this.cameraMat;
        },
        view: function() {
            return this.viewMat;
        },
        orientation: function() {
            return this.orientMat;
        },
    };

    cameras.arcball = arcball;
    return cameras;

})(cameras || {});
