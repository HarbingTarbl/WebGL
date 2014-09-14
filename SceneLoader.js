var ContentLoader = function(bindings, models, shaders, textures){	
	var modelsPromises = [];
	var shadersPromises = [];
	var texturePromises = [];


	var loadModel = function(model){
		return new Promise(function(resolve, reject){
			LoadModel(model, function(asset){
				resolve({asset.Objects});
			});
		});
	};

	var loadShader = function(shader){
		return new Promise(function(resolve, reject){
			var programs = {};
			ShaderSource(shader, function(s){
				for (var name in s){
					programs[name] = new ShaderProgram({
						vertex: s[name].vertex,
						fragment: s[name].fragment,
						binds: bindings
					});
				}
				resolve(programs);
			});
		});
	};

	shaders.reduce(function(previous, current, index, array){
		shadersPromises.push(loadShader(currentValue));
	});
};


ContentLoader.prototype.doneLoading = function(){

};