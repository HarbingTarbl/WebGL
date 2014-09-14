var ArcballCamera = function(target, cameraInverse){
	this.active = false;
	this.origin = vec2.create();
	this.start = vec2.create();
	this.current = vec2.create();
	this.target = target;
	this.startSphereCoords = vec4.create();
	this.currentSphereCoords = vec4.create();
	this.turnstileAxis = vec4.create();
	this.angle = 0;
	this.cameraInverse = cameraInverse;
	this.rotationMatrix = mat4.create();
	mat4.identity(this.rotationMatrix);

	this.boundOnMouseMove = this.onmousemove.bind(this);
	this.boundOnMouseUp = this.onmouseup.bind(this);
	this.boundOnMouseDown = this.onmousedown.bind(this);

	target.addEventListener("mousedown", this.boundOnMouseDown, false);
	target.addEventListener("mousemove", this.boundOnMouseMove, false);
	window.addEventListener("mouseup", this.boundOnMouseUp, false);
};

ArcballCamera.prototype.resetRotation = function(){
	mat4.identity(this.rotationMatrix);
}

ArcballCamera.prototype.calcPoint = function(out, screen){
	vec3.set(out, 
		(screen[0] / this.target.width) * 2 - 1,
		(screen[1] / this.target.height) * 2 - 1,
		0.0);


	//out[2] = out[0] * out[0] - out[1] * out[1];
	if(1.0){
		//out[2] = 0.0;
		vec3.normalize(out, out);
		out[2] = out[2] * 2 - 1;
	} else {
		//out[2] = Math.sqrt(1.0 - out[2]);
	}
}


ArcballCamera.prototype.onmousemove = function(e){
	if(this.active === false)
		return true;

	this.current[0] = e.clientX - this.origin[0];
	this.current[1] = e.clientY - this.origin[1];


	if(Math.abs(this.current[0] - this.start[0]) <= 0.01 || Math.abs(this.current[1] - this.start[1]) <= 0.01)
		return true;

	this.calcPoint(this.currentSphereCoords, this.current);
	//this.angle = Math.acos(Math.min(1.0, vec3.dot(this.currentSphereCoords, this.startSphereCoords)));
	this.angle = vec3.dot(this.currentSphereCoords, this.startSphereCoords);
	this.turnstileAxis[3] = 0;
	vec3.cross(this.turnstileAxis, this.currentSphereCoords, this.startSphereCoords);
	vec4.transformMat4(this.turnstileAxis, this.turnstileAxis, this.cameraInverse);
	console.log(this.turnstileAxis);
	mat4.identity(this.rotationMatrix);
	mat4.rotate(this.rotationMatrix, this.rotationMatrix, this.angle, this.turnstileAxis);
	this.applyRotation(this.rotationMatrix);


	return true;
};	

ArcballCamera.prototype.onmousedown = function(e){
	if(e.button === 0){
		this.active = true;
		this.start[0] = this.current[0] = e.clientX - this.origin[0];
		this.start[1] = this.current[1] = e.clientY - this.origin[1];
		this.calcPoint(this.startSphereCoords, this.start);
	}
	return true;
};

ArcballCamera.prototype.onmouseup = function(e){
	if(e.button === 0){
		this.active = false;
	}
	return true;
};

ArcballCamera.prototype.onclick = function(e){

};

ArcballCamera.prototype.applyRotation = function(e){

};