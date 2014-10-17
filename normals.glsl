--- START NoMapping ---
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec3 aBitangent;
attribute vec2 aTexture;

varying vec3 vPosition;
varying vec3 vTangent;
varying vec3 vBitangnet;
varying vec3 vNormal;
varying vec2 vTexture;

uniform mat3 uViewNormalMatrix;
uniform mat4 uViewModelMatrix;
uniform mat4 uProjectionMatrix;

void main()
{
	gl_Position = vec4(aPosition, 1.0);
	gl_Position = uViewModelMatrix * pos;
	
	vPosition = gl_Position.xyz;
	vNormal = uViewNormalMatrix * aNormal;
	vTangent = uViewNormalMatrix * aTangent;
	vBitangnet = uViewNormalMatrix * aBitangent;
	vTexture = aTexture;
	gl_Position = uProjectionMatrix * pos;
}
//Todo be able to break shaders into bits.
//Another todo. WebGL shader compiler
---
precision highp float;

varying vec3 vPosition;
varying vec3 vTangent;
varying vec3 vBitangnet;
varying vec3 vNormal;
varying vec2 vTexture;

uniform float uViewNear;
uniform float uViewFar;

uniform sampler2D sAlbedo;

//Courtesy of .... Some Dude On The Inter-Tubes.
vec4 pack_depth(const in float depth)
{
    const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);
    const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
    vec4 res = fract(depth * bit_shift);
    res -= res.xxyz * bit_mask;
    return res;
}

void main()
{
	gl_FragData[0].rgb = texture2D(sAlbedo, vTexture);
	gl_FragData[1].rgb = vNormal * 0.5 + 0.5;
	gl_FragData[2].rgba = pack_depth((-vPosition.z - uViewNear) / (uViewFar - uViewNear)); //Given how my cameras work, this should be +
}

--- END ---

--- START NormalMapping ---
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec3 aBitangent;
attribute vec2 aTexture;

varying vec3 vPosition;
varying vec3 vTangent;
varying vec3 vBitangnet;
varying vec3 vNormal;
varying vec2 vTexture;

uniform mat3 uViewNormalMatrix;
uniform mat4 uViewModelMatrix;
uniform mat4 uProjectionMatrix;

void main()
{
	gl_Position = vec4(aPosition, 1.0);
	gl_Position = uViewModelMatrix * pos;
	
	vPosition = gl_Position.xyz;
	vNormal = uViewNormalMatrix * aNormal;
	vTangent = uViewNormalMatrix * aTangent;
	vBitangnet = uViewNormalMatrix * aBitangent;
	vTexture = aTexture;
	gl_Position = uProjectionMatrix * pos;
}

---
//Bla bla
precision highp float;


void main()
{

}

--- END ---

--- START ParallaxMapping ---
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec3 aBitangent;
attribute vec2 aTexture;

varying vec3 vPosition;
varying vec3 vTangent;
varying vec3 vBitangnet;
varying vec3 vNormal;
varying vec2 vTexture;

uniform mat3 uViewNormalMatrix;
uniform mat4 uViewModelMatrix;
uniform mat4 uProjectionMatrix;

void main()
{
	gl_Position = vec4(aPosition, 1.0);
	gl_Position = uViewModelMatrix * pos;
	
	vPosition = gl_Position.xyz;
	vNormal = uViewNormalMatrix * aNormal;
	vTangent = uViewNormalMatrix * aTangent;
	vBitangnet = uViewNormalMatrix * aBitangent;
	vTexture = aTexture;
	gl_Position = uProjectionMatrix * pos;
}

---
//Zzzzz
precision highp float;

void main()
{

}


--- END ---














--- START NormalMapping ---

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec3 aBitangent;
attribute vec2 aTexture;

uniform mat4 uVP;
uniform mat3 uNormalMatrix;


varying vec3 vPosition;
varying vec2 vTexture;
varying mat3 vTBN;

void main(){
	gl_Position = uVP * vec4(aPosition, 1.0);
	vPosition = aPosition;
	vTBN = mat3(aTangent, aBitangent, aNormal);
	vTexture = aTexture;
}

---
#extension GL_OES_standard_derivatives: require

precision highp float;
varying vec3 vPosition;
varying vec2 vTexture;
varying mat3 vTBN;

#define MAX_LIGHTS 7

uniform vec4 uLights[MAX_LIGHTS];
uniform sampler2D height0;
uniform int uMode;


void main(){
	float lambertSum = 0.0;
	float specularSum = 0.0;

	mat3 tbn = mat3(
		normalize(vTBN[0]),
		normalize(vTBN[1]),
		normalize(vTBN[2]));


	vec3 normal;


	if(uMode == 0)
	{
		normal = texture2D(height0, vTexture).rgb * 2.0 - 1.0;
		normal = tbn * normalize(normal);
	}
	else if(uMode == 1)
	{

		vec3 vSigmaS = dFdx(vPosition);
		vec3 vSigmaT = dFdy(vPosition);
		vec3 vN = tbn[2];

		vec3 vR1 = cross(vSigmaT, vN);
		vec3 vR2 = cross(vN, vSigmaS);

		float fDet = dot(vSigmaS, vR1);

		vec2 TexDx = dFdx(vTexture);
		vec2 TexDy = dFdy(vTexture);
		vec2 STll = vTexture;

		float Hll = texture2D(height0, STll).x;
		float Hlr = dFdx(Hll);
		float Hul = dFdy(Hll);

		normal = sign(fDet) * (Hlr * tbn[0] + Hul * tbn[1]);
		normal = normalize(abs(fDet) * vN - normal);
	}

	for(int i = 0; i < MAX_LIGHTS; i++)
	{
		float lightPower = uLights[i].w;
		vec3 lightPosition = uLights[i].xyz;
		vec3 toLight = normalize(lightPosition - vPosition);

		float NdL = max(dot(normal, toLight), 0.0) / distance(lightPosition, vPosition);
		NdL *= lightPower;

		lambertSum += NdL;
	}


	gl_FragColor.xyz = normal * 0.5 + 0.5;
}

--- END ---

--- START HeightMappig ---
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec3 aBitangent;
attribute vec2 aTexture;

varying vec3 vPosition;
varying mat3 vTBN;
varying vec2 vTexture;

uniform mat3 uNormalMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewProjMatrix;

void main()
{
	vec4 pos = vec4(aPosition, 1.0);
	pos = uModelMatrix * pos;
	vPosition = pos.xyz;
	gl_Position = uViewProjMatrix * pos;
	vTBN = uNormalMatrix * mat3(aTangent, aNormal, aBitangent);
	vTexture = aTexture;
}

---
#extension GL_OES_standard_derivatives: require

precision highp float;
varying vec3 vPosition;
varying mat3 vTBN;
varying vec2 vTexture;

uniform sampler2D sHeightMap;

uniform float uHeightMapTexelScale;

void main()
{
	mat3 tbn = mat3(
		normalize(vTBN[0]),
		normalize(vTBN[1]),
		normalize(vTBN[2])
		);

	float height = texture2D(sHeightMap, vTexture).r;
	float dt = dFdx(height);
	float db = dFdy(height);

	vec3 normal = normalize(tbn[2] + dt * cross(tbn[2], tbn[0]) - db * cross(tbn[2], tbn[1]));

	gl_FragColor.xyz = normal * 0.5 + 0.5;
}



--- END ---



