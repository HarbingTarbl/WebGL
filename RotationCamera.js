function CameraRotator(canvas, settings, callback){

	this.Settings = function(settings){
		this.viewPosition = vec3.create(),
		this.targetPosition = vec3.create(),
		this.upDirection = [0,1,0],
		this.fov = 65.0 / 180 * 3.14 
		this.nearPlane = 0.1,
		this.farPlane = 50.0
	};

	this.mouseState = 0;
	this.lastX = 0;
	this.lastY = 0;
	this.rotationMatrix = mat4.create();
	this.perspectiveMatrix = mat4.create();
	this.lookAtMatrix = mat4.create();
	this.vpMatrix = mat4.create();
	this.mouseButton = 0;

	mat4.lookAt(this.lookAtMatrix, settings.viewPosition, settings.targetPosition, settings.upDirection);
	mat4.perspective(this.perspectiveMatrix, settings.fov, canvas.width / canvas.height, settings.nearPlane, settings.farPlane);


    canvas.onmousedown = (function(me){
    	return function (e) {
        	me.mouseState = 1;
        	me.mouseButton = e.button;
        	me.lastX = e.x;
        	me.lastY = e.y;
        	return true;
		}
	})(this);

    window.onmouseup = (function(me){
    	return function (e) {
        	me.mouseState = 0;
        	return true;
    	};
    })(this);

    canvas.onmousemove = (function(me){
    	return function(e){
        	if(canvas.mouseState === 0)
            	return true;

        	var deltaX = e.x - canvas.mouseX;
        	var deltaY = e.y - canvas.mouseY;
        	canvas.mouseX = e.x;
        	canvas.mouseY = e.y;

        	mat4.identity(canvas.objectRotation);
        	mat4.rotateY(canvas.objectRotation, canvas.objectRotation, deltaX / 200.0);
        	mat4.rotateX(canvas.objectRotation, canvas.objectRotation, deltaY / 200.0);

        	if(canvas.mouseButton === 0){ //Left Click
            	mat4.mul(scene.Transform, canvas.objectRotation, scene.Transform);

        	} else if(canvas.mouseButton === 2){ //Right Click
            	vec3.transformMat4(drawpass.lightPosition, drawpass.lightPosition, canvas.objectRotation);
 	       }
        return true;
    })(this);

    canvas.oncontextmenu = function(e){
        return false;
    };


}