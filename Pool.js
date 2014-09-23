var Pool = function(createFunc, initalSize){
	this.pooledObjects = new Array(initalSize);
	this.availableObjects = new Array(initalSize);
	for(var k in this.pooledObjects){
		this.pooledObjects[k] = createFunc();
		this.availableObjects[k] = this.pooledObjects[k];
	}
	this.createFunc = createFunc;

	this.activeObjects = new Array();
	this.initalSize = initalSize;
	this.currentSize = initalSize;
};


Pool.prototype.get = function(handler){
	if(this.availableObjects.length == 0){
		console.log("Increasing memory pool from ", this.currentSize , " to ", this.currentSize * 2);
		for(var i = 0; i < this.currentSize; i++){
			var k = this.createFunc();
			this.pooledObjects.push(k);
			this.availableObjects.push(k);
		}
	}

	return this.availableObjects.pop();
};

Pool.prototype.release = function(obj){
	this.availableObjects.push(obj);
};