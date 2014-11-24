var sceneHandler = (function(sceneHandler){
	"use strict";
	var potato = {
		init: function(){
			var assets = scene.neededAssets();
			//scene.camera = scene.createCamera();
			loader.load(assets).then((function(assets){
				this.scene = scene.init(assets);
				this.frame = this.frame.bind(this);
				this.frame();
				console.log("TEST");
			}).bind(this)).catch(function(a) {
                var err = a.stack;
                console.log(err);
                console.log("%cError during init loading creation\n" + a.fileName + " " + a.lineNumber + " " + a, "color:red");
            });

			return this;
		},
		frame: function(){
			scene.frame();
			window.requestAnimationFrame(this.frame);
		}
	};

	var prop = {

	};

	return Object.create(potato, prop);
})(sceneHandler || {});