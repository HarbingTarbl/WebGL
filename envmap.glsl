--- START SimpleEnvMap ---

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexture;

uniform mat4 uMVPMatrix;
uniform mat3 uNormalMatrix;

varying vec2 vTexture;
varying vec3 vNormal;

void main()
{
	vNormal = uNormalMatrix * aNormal;
	gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
	vTexture = aTexture;
}

---
precision mediump float;

uniform samplerCube sEnvMap;

void main()
{
	gl_FragColor = vec4(0.2, 0.5, 0.3, 1.0);
}


--- END ---