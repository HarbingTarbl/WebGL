var ArcballCamera = function(target, viewInverse){
	this.active = false;
	this.origin = vec2.create();
	this.start = vec2.create();
	this.current = vec2.create();
	this.target = target;
	this.startSphereCoords = vec4.create();
	this.currentSphereCoords = vec4.create();
	this.turnstileAxis = vec4.create();
    this.viewInverse = mat4.create();

    this.rotationMatrix = mat4.create();
    this.overallRotation = quat.create()
    this.startingRotation = quat.create();
    this.frameRotation = quat.create();

	this.boundOnMouseMove = this.onmousemove.bind(this);
	this.boundOnMouseUp = this.onmouseup.bind(this);
	this.boundOnMouseDown = this.onmousedown.bind(this);

	target.addEventListener("mousedown", this.boundOnMouseDown, false);
	target.addEventListener("mousemove", this.boundOnMouseMove, false);
	window.addEventListener("mouseup", this.boundOnMouseUp, false);
};

ArcballCamera.prototype.resetRotation = function() {
    mat4.identity(this.rotationMatrix);
};

ArcballCamera.prototype.calcPoint = function(screen, out){
	vec4.set(out, 
		(screen[0] / this.target.width) * 2 - 1,
		(screen[1] / this.target.height) * -2 + 1, 0, 0);


    out[2] = out[0] * out[0] + out[1] * out[1];
    if(out[2] >= 1.0){
        out[2] = 0;
    } else{
        out[2] = Math.sqrt(1.0 - out[2]);
    }

    vec3.normalize(out, out);
};


ArcballCamera.prototype.onmousemove = function(e){
	if(this.active === false)
		return true;

	this.current[0] = e.clientX - this.origin[0];
	this.current[1] = e.clientY - this.origin[1];

    this.calcPoint(this.current, this.currentSphereCoords);
    this.angle = Math.acos(Math.min(vec3.dot(this.currentSphereCoords, this.startSphereCoords), 1.0));
    vec3.cross(this.turnstileAxis, this.currentSphereCoords, this.startSphereCoords);


    quat.setAxisAngle(this.frameRotation, this.turnstileAxis, this.angle * -2);

    quat.normalize(this.frameRotation, this.frameRotation);


    quat.mul(this.overallRotation, this.frameRotation, this.startingRotation);

    mat4.fromQuat(this.rotationMatrix, this.overallRotation);
    this.applyRotation(this.rotationMatrix);
    return true;
};	

ArcballCamera.prototype.onmousedown = function(e){
	if(e.button === 0){
		this.active = true;
		this.start[0] = this.current[0] = e.clientX - this.origin[0];
		this.start[1] = this.current[1] = e.clientY - this.origin[1];
        this.calcPoint(this.start, this.startSphereCoords);
        quat.copy(this.startingRotation, this.overallRotation);
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