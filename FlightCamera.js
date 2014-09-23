"use strict";

var FPCamera = function() {
	this.viewMatrix = mat4.create();
	this.yaw = 0;
	this.pitch = 0

	//this.xaxis = new Adapter(this.viewMatrix, 3, 0, 1);
	//this.yaxis = new Adapter(this.viewMatrix, 3, 4, 1);
	//this.zaxis = new Adapter(this.viewMatrix, 3, 8, 1)

	this.up = vec3.create();
	this.forward = vec3.create();
	this.right = vec3.create();

	//this.xaxis[0] = -1;
	//this.zaxis[2] = -1;
	//this.translation = new Adapter(this.viewMatrix, 3, 12, 1);

	this.position = vec3.create();

	this._scratchRotator = mat4.create();
};

FPCamera.xaxis = new Float32Array([1, 0, 0]);
FPCamera.yaxis = new Float32Array([0, 1, 0]);
FPCamera.zaxis = new Float32Array([0, 0, 1]);

FPCamera.prototype.updateCamera = function(){
	mat4.identity(this._scratchRotator);
	mat4.rotateY(this._scratchRotator, this._scratchRotator, this.pitch);
		mat4.rotateX(this._scratchRotator, this._scratchRotator, this.yaw);
	vec3.transformMat4(this.forward, FPCamera.zaxis, this._scratchRotator);

	vec3.transformMat4(this.up, FPCamera.yaxis, this._scratchRotator);


	//vec3.transformQuat(this.zaxis, FPCamera.zaxis, this._scratchRotator);

	vec3.add(this.forward, this.forward, this.position);
	mat4.lookAt(this.viewMatrix, this.position, this.forward, this.up);
	vec3.sub(this.forward, this.forward, this.position);

	vec3.normalize(this.forward, this.forward);
	vec3.normalize(this.up, this.up);
	vec3.cross(this.right, this.forward, this.up);

	// this.translation[0] = -(this.xaxis[0] * this.position[0] + this.yaxis[0] * this.position[1] + this.zaxis[0] * this.position[2]);
	// this.translation[1] = -(this.xaxis[1] * this.position[0] + this.yaxis[1] * this.position[1] + this.zaxis[1] * this.position[2]);
	// this.translation[2] = -(this.xaxis[2] * this.position[0] + this.yaxis[2] * this.position[1] + this.zaxis[2] * this.position[2]);
};
