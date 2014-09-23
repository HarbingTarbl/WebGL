var Adapter = function(out, count, offset, stride){
	this._ref = out;
	this._offset = offset;
	this._stride = stride;
	this._count = count;

	for(var k = 0; k < count; k++)
	{
		Object.defineProperty(this, k, {
			get: Adapter.prototype.get(k, this),
			set: Adapter.prototype.set(k, this),
			enumerable: true
		});
	}

	Object.freeze(this);
};


Adapter.prototype.get = function(index, me){
	return function(){
		return me._ref[index * me._stride + me._offset];
	};
};

Adapter.prototype.set = function(index, me){
	return function(value){
		me._ref[index * me._stride + me._offset] = value;
	};
};