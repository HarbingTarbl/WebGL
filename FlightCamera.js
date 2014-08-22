"use strict";

function FlightCamera(args) {

	this._position = vec3.clone(args.position);

	if("lookat" in args) {
		this.forward = vec3.clone(args.lookat);
		vec3.sub(this.forward, this._position);
	}
	else if("facing" in args) {
		this.forward = args.facing;
	}

	this._hAngle = 0;
	this._vAngle = 0;

	Object.defineProperty(this, "hAngle", {
		set: function(v) {
			this._hAngle = v;
			this._orientationMatrix.recalc = true;
			this._viewMatrix.recalc = true;
		},
		get: function(){
			return this._hAngle;
		}
	});

	Object.defineProperty(this, "vAngle", {
		set: function(v){
			this._vAngle = v;
			this._orientationMatrix.recalc = true;
			this._viewMatrix.recalc = true;
		},
		get: function(){
			return this._vAngle;
		}
	});

	Object.defineProperty(this, "position", {
		set: function(v){
			this._position = v;
			this._viewMatrix.recalc = true;
		},
		get: function(){
			return this._position;
		}
	})

	this.orientation = quat.create();
	this._viewMatrix = mat4.create();
	this._viewMatrix.inverse = mat4.create();
	this._viewMatrix.recalc = true;

	Object.defineProperty(this, "viewMatrix", function(that) {
		return {
			get: function() {
				if(that._viewMatrix.recalc){
					that.orientation.rotateX(q, hAngle);
					that.orientation.rotateY(q, vAngle);

					mat4.fromRotationTranslation(that._viewMatrix, q, that._position);
					mat4.inverse(that._viewMatrix.inverse, that._viewMatrix);
					mat4.transpose(that._viewMatrix.inverse, that._viewMatrix.inverse);


					vec3.transformMat4(that.forward, [0,0,-1], that._viewMatrix.inverse);
				}

				return that._viewMatrix;
			}
		};
	}(this));
}