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
	gl_Position = uViewModelMatrix * gl_Position;
	
	vPosition = gl_Position.xyz;
	vNormal = uViewNormalMatrix * aNormal;
	vTangent = uViewNormalMatrix * aTangent;
	vBitangnet = uViewNormalMatrix * aBitangent;
	vTexture = aTexture;
	gl_Position = uProjectionMatrix * gl_Position;
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
	gl_FragColor.rgb = vNormal * 0.5 + 0.5;
	//gl_FragData[1].rgb = vNormal * 0.5 + 0.5;
	//gl_FragData[2].rgba = pack_depth((-vPosition.z - uViewNear) / (uViewFar - uViewNear)); //Given how my cameras work, this should be +
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
	gl_Position = uViewModelMatrix * gl_Position;
	
	vPosition = gl_Position.xyz;
	vNormal = uViewNormalMatrix * aNormal;
	vTangent = uViewNormalMatrix * aTangent;
	vBitangnet = uViewNormalMatrix * aBitangent;
	vTexture = aTexture;
	gl_Position = uProjectionMatrix * gl_Position;
}

---
//Bla bla
precision highp float;

uniform sampler2D sNormalMap;

varying vec3 vPosition;
varying vec3 vTangent;
varying vec3 vBitangnet;
varying vec3 vNormal;
varying vec2 vTexture;

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
	mat3 tbn = mat3(normalize(vTangent), normalize(vBitangnet), normalize(vNormal));
	vec3 normal = normalize(texture2D(sNormalMap, vTexture).rgb * 2.0 - 1.0);
	normal = tbn * normal;


	gl_FragColor.rgb = normal * 0.5 + 0.5;
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
varying vec3 vEye;

uniform mat3 uViewNormalMatrix;
uniform mat4 uViewModelMatrix;
uniform mat4 uProjectionMatrix;

void main()
{
	gl_Position = vec4(aPosition, 1.0);
	gl_Position = uViewModelMatrix * gl_Position;
	
	vPosition = gl_Position.xyz;
	vEye = -normalize(vPosition);
	vNormal = uViewNormalMatrix * aNormal;
	vTangent = uViewNormalMatrix * aTangent;
	vBitangnet = uViewNormalMatrix * aBitangent;
	vTexture = aTexture;
	gl_Position = uProjectionMatrix * gl_Position;
}

---
//Zzzzz
precision highp float;

varying vec3 vPosition;
varying vec3 vTangent;
varying vec3 vBitangnet;
varying vec3 vNormal;
varying vec2 vTexture;
varying vec3 vEye;

uniform int uOffsetLimiting;
uniform float uHeightScale;
uniform float uHeightBias;

uniform sampler2D sNormalMap;
uniform sampler2D sHeightMap;

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
	mat3 tbn = mat3(normalize(vTangent), normalize(vBitangnet), normalize(vNormal));

	float height = texture2D(sHeightMap, vTexture).r * uHeightScale - uHeightBias;
	vec3 eyeTangent = normalize(vEye * tbn);

	vec2 offsetTexture = vTexture + height * eyeTangent.xy / eyeTangent.z;

	vec3 normal = normalize(texture2D(sNormalMap, offsetTexture).rgb * 2.0 - 1.0);
	normal = tbn * normal;


	gl_FragColor.rgb = normal * 0.5 + 0.5;
}


--- END ---




