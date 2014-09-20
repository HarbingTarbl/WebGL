var TextureLoader = function(){
	this.loadingTextures = {};
	this.loadedTextures = {};




};




TextureLoader.prototype.fakePromise = function(accept){
	return {
		then : function(a){
			this.func = a;
		}
	};
};

TextureLoader.prototype.texFinish = function(texture, img){
	texture.id = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture.id);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	if(img.width % 2 === 0 && img.height % 2 === 0){
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	else{
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
};

TextureLoader.prototype.getTexture = function(path){
	var texture, promise;

	if(path in this.loadingTextures){
		texture = this.loadingTextures[path];
		promise = TextureLoader.prototype.fakePromise(texture);
		texture.waits.push(promise)
		return promise;
	}

	if(path in this.loadedTextures){
		texture = this.loadedTextures[path];
		return Promise.resolve(texture);
	}

	promise = new Promise(function(accept, reject){
		var img = new Image();
		img.onload = function(){
			accept(texture, img);
		};
		img.src = path;
	});

	texture = {};
	texture.waits = [];
	texture.path = path;
	texture.promise = promise;

	promise.then(function(a){
		texFinish(a);
		texture.waits.forEach(function(b){
			b.func(texture);
		});

	}





};