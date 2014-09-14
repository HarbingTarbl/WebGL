var ArcballCamera = function(target, cameraRight, cameraUp){
	this.active = false;
	this.origin = vec2.create();
	this.start = vec2.create();
	this.current = vec2.create();
	this.target = target;
	this.startSphereCoords = vec4.create();
	this.currentSphereCoords = vec4.create();
	this.turnstileAxis = vec4.create();
	this.angle = 0;
	this.cameraRight = cameraRight;
	this.cameraUp = cameraUp;
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
	vec4.set(out, 
		(screen[0] / this.target.width) * 2 - 1,
		(screen[1] / this.target.height) * 2 - 1, 0, 1);

	vec4.transformMat4(out, out, this.cameraInverse);
}


ArcballCamera.prototype.onmousemove = function(e){
	if(this.active === false)
		return true;

	this.current[0] = e.clientX - this.origin[0];
	this.current[1] = e.clientY - this.origin[1];


	if(Math.abs(this.current[0] - this.start[0]) <= 0.01 || Math.abs(this.current[1] - this.start[1]) <= 0.01)
		return true;


	mat4.identity(this.rotationMatrix);
	console.log(this.cameraUp);
	
	mat4.rotate(this.rotationMatrix, this.rotationMatrix, (this.current[0] - this.start[0]) / 500.0, this.cameraUp);
	mat4.rotate(this.rotationMatrix, this.rotationMatrix, (this.current[1] - this.start[1]) / 500.0, this.cameraRight);

	this.applyRotation(this.rotationMatrix);
	return true;
};	

ArcballCamera.prototype.onmousedown = function(e){
	if(e.button === 0){
		this.active = true;
		this.start[0] = this.current[0] = e.clientX - this.origin[0];
		this.start[1] = this.current[1] = e.clientY - this.origin[1];
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