"use strict";

var brdf = (function(){
	var me = {};

	me.scene = null;
	me.canvas = null;

	me.startWGL = function(canvas){
		this.canvas = canvas;



		delete(this.startWGL);
	}


	return me;
})();


function startWGL(canvas){
	brdf.startWGL(canvas);
}