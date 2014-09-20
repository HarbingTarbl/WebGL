function LoadModel(path, callback){
	if( typeof LoadModel.blankTexture === "undefined" ){
		LoadModel.blankTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, LoadModel.blankTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	var model;
	var counter = {
		signal: function(){
			this.value--;
			console.log(this.value, " ↓");

			if(this.value == 0){
				callback(model);
			}
			else if(this.value < 0){
				console.log("Counter called after callback executed!");
			}
		},
		wait: function(){
			this.value++;
			console.log(this.value, " ↑");
		},
		value: 0, //What value should this be? Who knows! Guess until the page works again. 
	};

	var xhr = new XMLHttpRequest();
	xhr.open("GET", path, true);
	counter.wait();
	xhr.responseType = "json";
	console.log(xhr.responseType);
	xhr.onload = function(e) {
		model = xhr.response;
		if(typeof(model) === "string") { //Silly Safari, json != string. 
			model = JSON.parse(model);
		}
		var dataReq = new XMLHttpRequest();
		var dir = path.substr(0, path.lastIndexOf('/') + 1);
		console.log(dir);
		dataReq.open("GET", dir + model.data, true);
		counter.wait();
		dataReq.responseType = "arraybuffer";
		dataReq.onload = function(e) {
			model.data = dataReq.response;
			model.vertexBuffer = new Float32Array(model.data, model.vertexOffset, Math.round(model.vertexCount * model.vertexSize / 4.0));
			model.arrayBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, model.arrayBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, model.vertexBuffer, gl.STATIC_DRAW);

			for(var attrName in model.attributes){
				var attr = model.attributes[attrName];
				gl.enableVertexAttribArray(attr.index);
				gl.vertexAttribPointer(attr.index, attr.size, gl.FLOAT, false, 4 * model.vertexSize, attr.offset);
			}

			if(model.indexSize == 1){
				model.indexBuffer = new Uint8Array(model.data, model.indexOffset, Math.round(model.indexCount));
				model.elementType = gl.UNSIGNED_BYTE;
			} else if(model.indexSize == 2) {
				model.indexBuffer = new Uint16Array(model.data, model.indexOffset, Math.round(model.indexCount));
				model.elementType = gl.UNSIGNED_SHORT;
			} else if(model.indexSize == 4) {
				model.indexBuffer = new Uint32Array(model.data, model.indexOffset, Math.round(model.indexCount));
				model.elementType = gl.UNSIGNED_INT;
			}

			model.elementBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.elementBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

			model.VertexSize = 4 * model.VertexSize;

			delete(model.indexOffset);
			delete(model.indexBuffer);
			delete(model.vertexOffset);
			delete(model.vertexBuffer);
			delete(model.indexSize);
			delete(model.data);

			model.BindBuffers = function() {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.arrayBuffer);
				for(var attrName in this.attributes){
					var attr = this.attributes[attrName];
					gl.vertexAttribPointer(attr.index, attr.size, gl.FLOAT, false, this.vertexSize, attr.offset);
				}
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
			};
			counter.signal();
		};

		dataReq.send();
		for(var materialName in model.materials) {
			var material = model.materials[materialName];
			for(var textureName in material.textures){
				counter.wait();
				var img = new Image();
				img.onload = (function(material, name){
					return function(){
						var texture = gl.createTexture();

						gl.bindTexture(gl.TEXTURE_2D, texture);
						gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
						if(this.width % 2 === 0 && this.height % 2 === 0){
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
						material.textures[name] = texture;
						counter.signal();
					};
				})(material, textureName);
				img.onerror = (function(material, name){
					return function(){
						material.textures[textureName] = LoadModel.blankTexture;
						counter.signal();
						console.log("Missing texture ", name);
					};
				})(material, textureName);
				img.src = dir + material.textures[textureName];
			}
		}

		for(var meshIndex in model.meshes) {
			var mesh = model.meshes[meshIndex];
			mesh.material = model.materials[mesh.material];
			mesh.Draw = function(perMesh){
				perMesh(this);
				gl.drawElements(gl.TRIANGLES, this.indexCount, model.elementType, this.indexOffset);
			};
		}

		for(var objectIndex in model.objects){
			var objectElement = model.objects[objectIndex];
			objectElement.transform = new Float32Array(objectElement.transform);
			objectElement.normalMatrix = mat3.create();
			objectElement.UpdateNormal = function(){
				mat3.fromMat4(this.normalMatrix, this.transform);
				mat3.invert(this.normalMatrix, this.normalMatrix);
				mat3.transpose(this.normalMatrix, this.normalMatrix);
			};

			for(var objectIndexMeshIndex in objectElement.meshes){
				var objectMeshIndex = objectElement.meshes[objectIndexMeshIndex];
				objectElement.meshes[objectIndexMeshIndex] = model.meshes[objectMeshIndex];
			}

			objectElement.Draw = function(perObject, perMesh){
				perObject(this);
				for(var meshIndex in this.meshes){
					this.meshes[meshIndex].Draw(perMesh);
				};
			};
		};

		model.Draw = function(perObject, perMesh){
			for(var objectIndex in this.objects){
				this.objects[objectIndex].Draw(perObject, perMesh);
			}
		};

		counter.signal();
	};

	xhr.send();
}
