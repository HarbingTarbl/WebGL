--- START SimpleEnvMap ---

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexture;

uniform mat4 uVPMatrix;

uniform mat3 uNormalMatrix;

varying vec2 vTexture;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
	vNormal = aNormal;
	gl_Position = uVPMatrix * vec4(aPosition, 1.0);
	vPosition = aPosition;
	vTexture = aTexture;
}

---
precision mediump float;

uniform samplerCube sEnvMap;

uniform vec3 uEye;
varying vec2 vTexture;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
	vec3 normal = normalize(vNormal);
	vec3 toeye = normalize(vPosition - uEye);
	vec3 r = reflect(toeye, normal);

	gl_FragColor = vec4(textureCube(sEnvMap, r).rgb, 1.0);
}


--- END ---


--- START Skybox ---
attribute vec3 aPosition;

uniform mat3 uOMatrix;
uniform mat4 uPMatrix;

varying vec3 vNormal;

void main()
{
	gl_Position.xyz = (uOMatrix * aPosition);
	gl_Position.w = 1.0;
	gl_Position = uPMatrix * gl_Position;
	vNormal = aPosition;
}

---
precision mediump float;
varying vec3 vNormal;

uniform samplerCube sCubeMap;

void main()
{
	vec3 normal = normalize(vNormal);

	gl_FragColor = textureCube(sCubeMap, normal);
}


--- END ---