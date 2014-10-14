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
uniform sampler2D sNormalMap;

uniform vec3 uEye;
varying vec2 vTexture;
varying vec3 vNormal;
varying vec3 vPosition;


void main()
{
	vec3 normal = normalize(vNormal);
	vec3 toeye = normalize(uEye - vPosition);
	vec3 r = reflect(-toeye, normal);

	vec3 light = normalize(vec3(1));
	float NdL = max(dot(normal, light), 0.0);


	vec3 reflectColor = textureCube(sEnvMap, r).rgb;
	reflectColor = pow(reflectColor, vec3(1.0 / 2.2));

	gl_FragColor = vec4(reflectColor * min(NdL + 1.0, 1.0), 1.0);
	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(2.2));
}

--- END ---

--- START CookTorr ---
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
uniform sampler2D sNormalMap;

uniform vec3 uEye;
varying vec2 vTexture;
varying vec3 vNormal;
varying vec3 vPosition;



uniform float uLambertCoeff;
uniform float uSpecularCoeff;
uniform float uSpecularPower;
uniform float uFresnelCoeff;
uniform float uSurfaceRougnessSqr;


float surfaceRoughness(float NdH)
{
	float NdHSqr = NdH * NdH;
	float denom = 1.0 / (3.14159 * uSurfaceRougnessSqr * NdHSqr * NdHSqr);
	float expow = (NdHSqr - 1.0) / (uSurfaceRougnessSqr * NdHSqr);
	return exp(expow) / denom;
}

float geometricAttenuation(float NdH, float NdL, float NdV, float LdH, float VdH)
{
	float left = (2.0 * NdH * NdV) / VdH;
	float right = (2.0 * NdH * NdL) / LdH;
	return min(1.0, min(left, right));
}

float fresnelSchlick(float VdH)
{
	float fres = pow(1.0 - VdH, 5.0) * 10.0;
	fres *= (1.0 - uFresnelCoeff);
	fres += uFresnelCoeff;
	return fres;
}

vec4 cookTorr(float VdH, float NdH, float NdL, float NdV, float LdH)
{
	float fres = fresnelSchlick(VdH);
	float rough = surfaceRoughness(NdH);
	float geo = geometricAttenuation(NdH, NdL, NdV, LdH, VdH);

	return vec4((fres * rough * geo) / (3.14159 * NdL * NdV), fres, rough, geo);
}

void main()
{
	vec3 normal = normalize(vNormal);
	vec3 toeye = normalize(uEye - vPosition);
	vec3 r = reflect(-toeye, normal);
	vec3 light = normalize(vec3(1));
	vec3 halfV = normalize(normal + toeye);

	float NdL = max(dot(normal, light), 0.0);
	float NdH = max(dot(normal, halfV), 0.0);
	float NdV = max(dot(normal, toeye), 0.0);
	float LdH = max(dot(light, halfV), 0.0);
	float VdH = max(dot(toeye, halfV), 0.0);


	vec4 cook = cookTorr(VdH, NdH, NdL, NdV, LdH);


	vec3 reflectColor = textureCube(sEnvMap, r).rgb;
	reflectColor = pow(reflectColor, vec3(1.0 / 2.2));

	gl_FragColor.rgb = vec3(cook.y);





	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(2.2));
	gl_FragColor.a = 1.0;
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