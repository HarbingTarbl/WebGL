var ArcballCamera = function(fov, aspect, near, far){
	this._activeRotation = quat.create();
	this._orientationQuat = quat.create();

	this._orientation = mat3.create();
	this._perspective = mat4.create();
	this._camera = mat4.create();
	this._view = mat4.create();
	this._clickOrigin = vec3.create();
	this._clickEnd = vec3.create();
	this._clickCross = vec3.create();
	this._isRotating = false;

	this._needsOrientationRecalc = false;

	this.position = vec3.create();

	mat4.perspective(this._perspective, fov, aspect, near, far);
};

ArcballCamera.prototype.startRotating = function(x, y){

};

ArcballCamera.prototype.update = function(x, y){

};

ArcballCamera.prototype.endMovement = function(x, y){

};


ArcballCamera.prototype.beginRotation = function(x, y){
	if(this._isRotating === true){
		return;
	}

	vec3.set(this._clickOrigin, x, y, Math.sqrt(1.0 - (x*x + y*y)));
	if(vec3.length(this._clickOrigin) > 1){
		vec3.normalize(this._clickOrigin, this._clickOrigin);
	}
	this._isRotating = true;
	this._needsOrientationRecalc = false;
};

ArcballCamera.prototype.rotateSphere = function(start, end){
	var a = vec3.fromValues(start[0], start[1], Math.sqrt(1.0 - (vec2.dot(start, start))));
	var b = vec3.fromValues(end[0], end[0], Math.sqrt(1.0 - vec2.dot(end, end)));

	if(vec3.length(a) > 1)
		vec3.normalize(a, a);

	if(vec3.length(b) > 1)
		vec3.normalize(b, b)

	var c = vec3.cross(vec3.create(), a, b);
	var rot = quat.setAxisAngle(quat.create(), c, Math.acos(vec3.dot(a, b)));
	return rot;
};



ArcballCamera.prototype.startRotation = function(start){
	vec3.set(this._startingPoint, start[0], start[1], Math.sqrt(1.0 - vec2.dot(start, start)));
	if(vec3.length(this._startingPoint) > 1){
		vec3.normalize(this._startingPoint, this._startingPoint);
	}
};

ArcballCamera.prototype.updateRotation = function(update){
	vec3.set(this._currentPoint, update[0], update[1], Math.sqrt(1.0 - vec2.dot(update, update)));
	if(vec3.length(this._currentPoint) > 1){
		vec3.normalize(this._currentPoint, this._currentPoint);
	}
};

ArcballCamera.prototype.calcRotation = function(out, start, current){

};

ArcballCamera.prototype.applyRotation = function(){

};

ArcballCamera.prototype.endRotation = function(){

}

ArcballCamera.prototype.applyRotationQuat = function(rotation){
	quat.mul(this._orientationQuat, this._orientationQuat, rotation);
};

ArcballCamera.prototype.applyRotationMat4 = function(rotation){

};

ArcballCamera.prototype.applyRotationMat3 = function(rotation){

};

ArcballCamera.prototype.updateRotation = function(x, y){
	if(this._isRotating === false){
		return;
	}


	vec3.set(this._clickEnd, x, y, Math.sqrt(1.0 - (x*x + y*y)))
	if(vec3.length(this._clickEnd) > 1){
		vec3.normalize(this._clickEnd, this._clickEnd);
	}
	var angle = Math.acos(vec3.dot(this._clickOrigin, this._clickEnd));
	vec3.cross(this._clickCross, this._clickOrigin, this._clickEnd);
	quat.setAxisAngle(this._activeRotation, this._clickCross, angle);
	quat.normalize(this._activeRotation, this._activeRotation);
	this._needsOrientationRecalc = true;
};

ArcballCamera.prototype.endRotation = function(x, y){
	if(this._isRotating === false)
		return;

	this.updateRotation(x,y);
	this.updateOrientation();


	this.


};


ArcballCamera.prototype.update = function(){
	if(this._needsOrientationRecalc === false)
		return;

	quat.mul(this._orientationQuat, this._orientationQuat, this._activeRotation);
	mat3.fromQuat(this._orientation, this._orientationQuat);

	this._needsOrientationRecalc = false;
	mat4.fromRotationTranslation(this._view, this._orientationQuat, this.position);
	mat4.mul(this._camera, this._perspective, this._view);
};

ArcballCamera.prototype.orientation = function(){

	return this._orientation;
};

ArcballCamera.prototype.view = function(){
	return this._view;
};

ArcballCamera.prototype.camera = function(){
	return this._camera;
};