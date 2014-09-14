var TexturePromise = function(path){
	var promise = new Promise(function(resolve, reject){
		var img = new Image();
		img.onload = function(){
			var TextureObject = {};
			TextureObject.id = gl.createTexture();
			TextureObject.src = path;
			resolve(TextureObject);
		};
		img.src = path;
	});

	return promise;
};



var TextureLoader = function(){
	var me = this;
	this.enqueueTexture = function(path, succ, fail){
		var promise = new Promise(function(resolve, reject){
			var img = new Image();
			img.onload = function(){
				var textureObj = {};
				textureObj.id = gl.createTexture();
				textureObj.src = path;
				succ(textureObj);
				resolve(textureObj);
			};

			img.onerror = function(){
				fail(path);
				reject("Failed to load " + path);
			};

			img.src = path;
		});

		this.promises.push(promise);

		if(this.promises.length === 0){
			this.nextPromise();
		}
	};

	this.nextPromise = function(){
		if(this.promises.length === 0)
			return;

		var promise = this.promises.pop();
		promise.then(this.nextPromise);
	};

	this.promises = []
};