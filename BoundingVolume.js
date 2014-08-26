function BoundingVolume(center, extents) {
	this.center = center;
	this.extents = extents;

	this.width = function() {
		return this.extents[0] * 2;
	};

	this.height = function() {
		return this.extents[1] * 2;
	};

	this.depth = function() {
		return this.extents[2] * 2;
	};

	this.left = function() {
		return this.center[0] - this.extents[0];
	};

	this.right = function() {
		return this.center[0] + this.extents[0];
	};

	this.front = function() {
		return this.center[2] + this.extents[2];
	};

	this.back = function() {
		return this.center[2] - this.extents[2];
	};

	this.top = function() {
		return this.center[1] + this.extents[1];
	};

	this.bottom = function() { 
		return this.center[1] - this.extents[1];
	};

	this.min = function() {
		return [this.left(), this.bottom(), this.back()];
	};

	this.max = function() {
		return [this.right(), this.top(), this.front()];
	};

	this.union = function(other) {
		var min = vec3.create();
		vec3.min(min, this.min(), other.min());
		var max = vec3.create();
		vec3.max(max, this.max(), other.max());

		var center = vec3.create();
		vec3.add(center, max, min);

		this.center[0] = center[0] / 2.0;
		this.center[1] = center[1] / 2.0;
		this.center[2] = center[2] / 2.0;		

		this.extents[0] = max[0] - this.center[0];
		this.extents[1] = max[1] - this.center[1];
		this.extents[2] = max[2] - this.center[2];
	};

	this.transform = function(transform) {
		var min = this.min();
		var max = this.max();

		var points = new Array(8);
		points[0] = vec4.fromValues(min[0], min[1], min[2], 1);
		points[1] = vec4.fromValues(min[0], min[1], max[2], 1);
		points[2] = vec4.fromValues(min[0], max[1], min[2], 1);
		points[3] = vec4.fromValues(min[0], max[1], max[2], 1);
		points[4] = vec4.fromValues(max[0], min[1], min[2], 1);
		points[5] = vec4.fromValues(max[0], min[1], max[2], 1);
		points[6] = vec4.fromValues(max[0], max[1], min[2], 1);
		points[7] = vec4.fromValues(max[0], max[1], max[2], 1);


		vec4.transformMat4(points[0], points[0], transform);
		for(var i = 0; i < 3; i++) {
			min[i] = max[i] = points[0][i];
		}

		for(var i = 1; i < 8; i++) {
			vec4.transformMat4(points[i], points[i], transform);
			for(var k = 0; k < 3; k++) {
				points[i][k] /= points[i][3];
			}
			
			vec3.min(min, min, points[i]);
			vec3.max(max, max, points[i]);
		}

		var center = vec3.create();
		vec3.add(center, max, min);
		this.center[0] = center[0] / 2.0;
		this.center[1] = center[1] / 2.0;
		this.center[2] = center[2] / 2.0;
		
		this.extents[0] = max[0] - this.center[0];
		this.extents[1] = max[1] - this.center[1];
		this.extents[2] = max[2] - this.center[2];
	};

	this.copy = function() {
		return new BoundingVolume([this.center[0], this.center[1], this.center[2]], [this.extents[0], this.extents[1], this.extents[2]]);
	};
};
