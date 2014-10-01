var Adapter = function(out, count, offset, stride){
	this._ref = out;
	this._offset = offset;
	this._stride = stride;
	this._count = count;

	for(var k = 0; k < count; k++)
	{
		Object.defineProperty(this, k, {
			get: Adapter.prototype._get(k, this),
			set: Adapter.prototype._set(k, this),
			enumerable: true
		});
	}
};


Adapter.prototype._get = function(index, me){
	return function(){
		return me._ref[index * me._stride + me._offset];
	};
};

Adapter.prototype._set = function(index, me){
	return function(value){
		me._ref[index * me._stride + me._offset] = value;
	};
};