function CameraRotator(canvas, leftCallback, rightCallback){
	this.mouseState = 0;
	this.lastX = 0;
	this.lastY = 0;
	this.rotationQuat = quat.create();
	this.mouseButton = 0;
    this.canvas = canvas;

    canvas.onmousedown = (function(me){
    	return function (e) {
        	me.mouseState = 1;
        	me.mouseButton = e.button;
        	me.lastX = e.clientX;
        	me.lastY = e.clientY;
        	return true;
		}
	})(this);

    window.onmouseup = (function(me){
    	return function (e) {
        	me.mouseState = 0;
        	return true;
    	};
    })(this);

    canvas.onmousemove = (function(me) {
        return function (e) {
            if (me.mouseState === 0)
                return true;

            var deltaX = e.clientX - me.lastX;
            var deltaY = e.clientY - me.lastY;

            me.lastX = e.clientX;
            me.lastY = e.clientY;

            quat.identity(me.rotationQuat);
            quat.rotateX(me.rotationQuat, me.rotationQuat, deltaX);
            quat.rotateY(me.rotationQuat, me.rotationQuat, deltaY);

            if (me.mouseButton === 0) { //Left Click
                leftCallback(me.rotationQuat);
            } else if (me.mouseButton === 2) { //Right Click
                rightCallback(me.rotationQuat);
            }

            return true;
        }
    })(this);

    canvas.oncontextmenu = function(e){
        return false;
    };

}