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
		dataReq.open("GET", dir + model.Data, true);
		counter.wait();
		dataReq.responseType = "arraybuffer";
		dataReq.onload = function(e) {
			model.Data = dataReq.response;
			model.VertexBuffer = new Float32Array(model.Data, model.VertexOffset, Math.round(model.VertexCount * model.VertexSize));
			model.ArrayBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, model.ArrayBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, model.VertexBuffer, gl.STATIC_DRAW);

			for(var attrName in model.Attributes){
				var attr = model.Attributes[attrName];
				gl.enableVertexAttribArray(attr.Index);
				gl.vertexAttribPointer(attr.Index, attr.Size, gl.FLOAT, false, 4 * model.VertexSize, attr.Offset);
			}

			if(model.IndexSize == 1){
				model.IndexBuffer = new Uint8Array(model.Data, model.IndexOffset, Math.round(model.IndexCount));
				model.ElementType = gl.UNSIGNED_BYTE;
			} else if(model.IndexSize == 2) {
				model.IndexBuffer = new Uint16Array(model.Data, model.IndexOffset, Math.round(model.IndexCount));
				model.ElementType = gl.UNSIGNED_SHORT;
			} else if(model.IndexSize == 4) {
				model.IndexBuffer = new Uint32Array(model.Data, model.IndexOffset, Math.round(model.IndexCount));
				model.ElementType = gl.UNSIGNED_INT;
			}

			model.ElementBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.ElementBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.IndexBuffer, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

			model.VertexSize = 4 * model.VertexSize;

			delete(model.IndexOffset);
			delete(model.IndexBuffer);
			delete(model.VertexOffset);
			delete(model.VertexBuffer);
			delete(model.IndexSize);
			delete(model.Data);

			model.BindBuffers = function() {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.ArrayBuffer);
				for(var attrName in this.Attributes){
					var attr = this.Attributes[attrName];
					gl.vertexAttribPointer(attr.Index, attr.Size, gl.FLOAT, false, this.VertexSize, attr.Offset);
				}
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ElementBuffer);
			};
			counter.signal();
		};

		dataReq.send();
		for(var materialName in model.Materials) {
			var material = model.Materials[materialName];

			if(material.DiffuseTexture != ""){
				counter.wait();
				!function(mat){
					var img = new Image();
					img.onload = function() {
						var oldSrc = dir + mat.DiffuseTexture;
						mat.DiffuseTexture = gl.createTexture();
						mat.DiffuseTexture.src = oldSrc;
						gl.bindTexture(gl.TEXTURE_2D, mat.DiffuseTexture);
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

						counter.signal();
					};
					img.src = dir + mat.DiffuseTexture;
				}(material);
			} else{
				material.DiffuseTexture = LoadModel.blankTexture;
			}
			
			if(material.NormalTexture != ""){
				counter.wait();
				!function(mat){
					var img = new Image();
					img.onload = function() {
						var oldSrc = dir + mat.NormalTexture;
						mat.NormalTexture = gl.createTexture();
						mat.NormalTexture.src = oldSrc;
						gl.bindTexture(gl.TEXTURE_2D, mat.NormalTexture);
						gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
						if(img.width % 2 === 0 && img.height % 2 === 0){
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_NEAREST);
							gl.generateMipmap(gl.TEXTURE_2D);
						}
						else{
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						}
						gl.bindTexture(gl.TEXTURE_2D, null);

						counter.signal();
					};
					img.src = dir + mat.NormalTexture;
				}(material);
			}
			else{
				material.NormalTexture = LoadModel.blankTexture;
			}

			if(material.SpecularTexture != ""){
				counter.wait();
				!function(mat){
					var img = new Image();
					img.onload = function() {
						var oldSrc = dir + mat.SpecularTexture;
						mat.SpecularTexture = gl.createTexture();
						mat.SpecularTexture.src = oldSrc;
						gl.bindTexture(gl.TEXTURE_2D, mat.SpecularTexture);
						gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
						if(img.width % 2 === 0 && img.height % 2 === 0){

							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_NEAREST);
							gl.generateMipmap(gl.TEXTURE_2D);
						}
						else{
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
							gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						}
						gl.bindTexture(gl.TEXTURE_2D, null);

						counter.signal();
					};
					img.src = dir + mat.SpecularTexture;
				}(material);
			}
			else{
				material.SpecularTexture = LoadModel.blankTexture;
			}
		}

		for(var meshIndex in model.Meshes) {
			var mesh = model.Meshes[meshIndex];
			mesh.Material = model.Materials[mesh.Material];
			mesh.Draw = function(perMesh){
				perMesh(this);
				gl.drawElements(gl.TRIANGLES, this.IndexCount, model.ElementType, this.IndexOffset);
			};
		}

		for(var objectIndex in model.Objects){
			var objectElement = model.Objects[objectIndex];
			objectElement.Transform = new Float32Array(objectElement.Transform);
			objectElement.NormalMatrix = mat3.create();
			objectElement.UpdateNormal = function(){
				mat3.fromMat4(this.NormalMatrix, this.Transform);
				mat3.invert(this.NormalMatrix, this.NormalMatrix);
				mat3.transpose(this.NormalMatrix, this.NormalMatrix);
			};

			for(var objectIndexMeshIndex in objectElement.Meshes){
				var objectMeshIndex = objectElement.Meshes[objectIndexMeshIndex];
				objectElement.Meshes[objectIndexMeshIndex] = model.Meshes[objectMeshIndex];
			}

			objectElement.Draw = function(perObject, perMesh){
				perObject(this);
				for(var meshIndex in this.Meshes){
					this.Meshes[meshIndex].Draw(perMesh);
				};
			};
		};

		model.Draw = function(perObject, perMesh){
			for(var objectIndex in this.Objects){
				this.Objects[objectIndex].Draw(perObject, perMesh);
			}
		};

		counter.signal();
	};

	xhr.send();
}
