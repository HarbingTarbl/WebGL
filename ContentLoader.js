var ContentLoader = function(){

};

ContentLoader.LoadModel = function(model){
	return new Promise(function(resolve, reject){
		LoadModel(model, function(asset){
			resolve(asset);
		});
	});
};

ContentLoader.LoadShader = function(bindings, shader){
	return new Promise(function(resolve, reject){
		LoadShaderSource(shader, function(s){
			var programs = {};
			for (var name in s){
				programs[name] = new ShaderProgram({
					vertex: s[name].vertex,
					fragment: s[name].fragment,
					binds: bindings
				}, false);
			}
			resolve(programs);
		});
	});
};

ContentLoader.Load = function(bindings, models, shaders, textures){	
	return new Promise(function(accept, reject){
		var me = {};
		me.modelsPromises = [];
		me.shadersPromises = [];
		me.texturePromises = [];

		shaders.forEach(function(current){
			me.shadersPromises.push(ContentLoader.LoadShader(bindings, current));
		});

		models.forEach(function(current){
			me.modelsPromises.push(ContentLoader.LoadModel(current));
		});

		Promise.all(me.shadersPromises).then(function(programs){
			me.program = {};
			programs.forEach(function(program){
				for(var name in program){
					me.program[name] = program[name];
				}
			});
			return Promise.resolve();
		}).then(function(){
			return Promise.all(me.modelsPromises).then(function(models){
				me.model = {};
				models.forEach(function(model){
					me.model[model.name] = model;
					// console.log(model);
					// for(var name in model){
					// 	me.model[name] = model[name];
					// }
				});
				return Promise.resolve();
			});
		}).then(function(){
			me.modelsPromises = null;
			me.shadersPromises = null;
			me.texturePromises = null;
			accept(me);
		});
	});
};



ContentLoader.prototype.doneLoading = function(){

};