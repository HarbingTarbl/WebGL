function CameraRotator(target, leftCallback, rightCallback){
	this.rotationMatrix = mat4.create();
    this.overallRotation = quat.create();
    this.frameRotation = quat.create();
    this.startingRotation = quat.create();
    this.active = false;


    this.start = vec2.create();
    this.current = vec2.create();

    this.target = target;


    this.boundOnMouseMove = this.onmousemove.bind(this);
    this.boundOnMouseUp = this.onmouseup.bind(this);
    this.boundOnMouseDown = this.onmousedown.bind(this);

    target.addEventListener("mousedown", this.boundOnMouseDown, false);
    target.addEventListener("mousemove", this.boundOnMouseMove, false);
    window.addEventListener("mouseup", this.boundOnMouseUp, false);
};


CameraRotator.prototype.onmousedown = function(e){
    if(e.button === 0){
        this.active =  true;
        this.current[0] = this.start[0] = e.clientX;
        this.current[1] = this.start[1] = e.clientY;
        quat.copy(this.startingRotation, this.overallRotation);
    }

    return true;
};

CameraRotator.prototype.onmouseup = function(e){
    if(e.button === 0) {
        this.active = false;
        quat.identity(this.frameRotation);
        quat.identity(this.overallRotation);

    }
    return true;
};

CameraRotator.prototype.onmousemove = function(e){
    this.current[0] = e.clientX;
    this.current[1] = e.clientY;

    if(!this.active)
        return true;

    quat.identity(this.frameRotation);
    quat.rotateX(this.frameRotation, this.frameRotation, (this.current[1] - this.start[1]) / 100.0);
    quat.rotateY(this.frameRotation, this.frameRotation, (this.current[0] - this.start[0]) / 100.0);



    quat.mul(this.overallRotation, this.frameRotation, this.startingRotation)
    quat.normalize(this.overallRotation, this.overallRotation);

    mat4.fromQuat(this.rotationMatrix, this.overallRotation);

    this.applyRotation(this.rotationMatrix);

    return true;
};

CameraRotator.prototype.applyRotation = function(rot){


};