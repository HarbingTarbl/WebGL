var Camera = function(fov, aspect, near, far){
	this._pitch = 0;
	this._yaw = 0;
	this._orientationInverseMatrix = mat4.create();
	this._orientationMatrix = mat4.create();
	this._perspectiveMatrix = mat4.create();
	this._cameraMatrix = mat4.create();
	this._position = vec3.create();
	this._negPosition = vec3.create();
	this._needsOrientationUpdate = true;
	this._needsCameraUpdate = true;

	this._forward = vec3.create();
	this._right = vec3.create();
	this._up = vec3.create();

	mat4.perspective(this._perspectiveMatrix, fov / 180 * 3.14159, aspect, near, far);
};

Camera.Forward = vec3.fromValues(0, 0, -1);
Camera.Right = vec3.fromValues(1, 0, 0);
Camera.Up = vec3.fromValues(0, 1, 0);

Camera.prototype.orientation = function(){
	if(this._needsOrientationUpdate){
		mat4.identity(this._orientationMatrix);
		mat4.rotateX(this._orientationMatrix, this._orientationMatrix, this._yaw);
		mat4.rotateY(this._orientationMatrix, this._orientationMatrix, this._pitch);
		mat4.invert(this._orientationInverseMatrix, this._orientationMatrix);
		vec3.transformMat4(this._forward, Camera.Forward, this._orientationInverseMatrix);
		vec3.transformMat4(this._right, Camera.Right, this._orientationInverseMatrix);
		vec3.transformMat4(this._up, Camera.Up, this._orientationInverseMatrix);
		this._needsOrientationUpdate = false;
		this._needsCameraUpdate = true;
	}

	return this._orientationMatrix;
};

Camera.prototype.camera = function(){
	this.orientation();

	if(this._needsCameraUpdate){
		mat4.mul(this._cameraMatrix, this._perspectiveMatrix, this._orientationMatrix);
		vec3.negate(this._negPosition, this._position);
		mat4.translate(this._cameraMatrix, this._cameraMatrix, this._negPosition);
		this._needsCameraUpdate = false;
	}

	return this._cameraMatrix;
};

Camera.prototype.offsetPitch = function(offset){
	this.setPitch(offset + this._pitch);
};

Camera.prototype.offsetYaw = function(offset){
	this.setYaw(offset + this._yaw);
};

Camera.prototype.offsetPosition = function(x, y, z){
	this.setPosition(x + this._position[0], y + this._position[1], z + this._position[2]);
};

Camera.prototype.setPosition = function(x, y, z){
	vec3.set(this._position, x, y, z);
	this._needsCameraUpdate = true;
};

Camera.prototype.setNeedsUpdate = function(){
	this._needsOrientationUpdate = true;
	this._needsCameraUpdate = true;
};

Camera.prototype.position = function(){
	return this._position;
};

Camera.prototype.forward = function(){
	return this._forward;
};

Camera.prototype.right = function(){
	return this._right;
};

Camera.prototype.up = function(){
	return this._up;
};

Camera.prototype.setPitch = function(pitch){
	this._pitch = pitch;
	this._needsOrientationUpdate = true;
};

Camera.prototype.setYaw = function(yaw){
	this._yaw = yaw;
	this._needsOrientationUpdate = true;
};

Camera.prototype.yaw = function(){
	return this._yaw;
};

Camera.prototype.pitch = function(){
	return this._pitch;
};

