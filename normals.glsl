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

uniform mat3 uNormalMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionViewMatrix;

uniform vec3 uMirrorPosition;
uniform vec3 uMirrorNormal;
uniform int uMirror;

void main()
{
	gl_Position = vec4(aPosition, 1.0);
	gl_Position = uModelMatrix * gl_Position;
	vNormal = uNormalMatrix * aNormal;
	vTangent = uNormalMatrix * aTangent;
	vBitangnet = uNormalMatrix * aBitangent;

	if(uMirror == 1)
	{
		vec3 toMirror = (gl_Position.xyz - uMirrorPosition);
		gl_Position.xyz = gl_Position.xyz - 2.0 * dot(toMirror, uMirrorNormal) * uMirrorNormal;
	}
	
	vPosition = gl_Position.xyz;


	vTexture = aTexture;
	gl_Position = uProjectionViewMatrix * gl_Position;
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
	float ff = gl_FrontFacing ? 1.0 : 1.0;
	vec3 normal = normalize(vNormal) * ff;
	gl_FragColor.rgb = vec3(min(max(dot(normal, normalize(vec3(1))), 0.0) + 0.1, 1.0));
	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
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

uniform mat3 uNormalMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionViewMatrix;

uniform vec3 uMirrorPosition;
uniform vec3 uMirrorNormal;
uniform int uMirror;

void main()
{
	gl_Position = vec4(aPosition, 1.0);
	gl_Position = uModelMatrix * gl_Position;

	if(uMirror == 1)
	{
		vec3 toMirror = (gl_Position.xyz - uMirrorPosition);
		gl_Position.xyz = gl_Position.xyz - 2.0 * dot(toMirror, uMirrorNormal) * uMirrorNormal;
	}
	
	vPosition = gl_Position.xyz;
	vNormal = uNormalMatrix * aNormal;
	vTangent = uNormalMatrix * aTangent;
	vBitangnet = uNormalMatrix * aBitangent;
	vTexture = aTexture;
	gl_Position = uProjectionViewMatrix * gl_Position;
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


	gl_FragColor.rgb = vec3(min(max(dot(normal, normalize(vec3(1))), 0.0) + 0.0, 1.0));
	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
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
varying vec3 vEyeTangent;


uniform vec3 uCameraLocation;
uniform mat3 uNormalMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionViewMatrix;


uniform vec3 uMirrorPosition;
uniform vec3 uMirrorNormal;
uniform int uMirror;

void main()
{
	gl_Position = vec4(aPosition, 1.0);
	gl_Position = uModelMatrix * gl_Position;
	
	vPosition = gl_Position.xyz;

	if(uMirror == 1)
	{
		vec3 toMirror = (gl_Position.xyz - uMirrorPosition);
		gl_Position.xyz = gl_Position.xyz - 2.0 * dot(toMirror, uMirrorNormal) * uMirrorNormal;
	}


	vNormal = uNormalMatrix * aNormal;
	vTangent = uNormalMatrix * aTangent;
	vBitangnet = uNormalMatrix * aBitangent;

	vEyeTangent = (vPosition - uCameraLocation) * mat3(vTangent, vBitangnet, vNormal);

	vTexture = aTexture;
	gl_Position = uProjectionViewMatrix * gl_Position;
}

---
precision highp float;

varying vec3 vPosition;
varying vec3 vTangent;
varying vec3 vBitangnet;
varying vec3 vNormal;
varying vec2 vTexture;
varying vec3 vEyeTangent;

uniform int uOffsetLimiting;
uniform float uHeightScale;
uniform float uHeightBias;

uniform sampler2D sNormalMap;
uniform sampler2D sHeightMap;
uniform sampler2D sDiffuseMap;


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
	float height = texture2D(sHeightMap, vTexture).r * uHeightScale;
	vec3 eyeTangent = normalize(-vEyeTangent);

	gl_FragColor.rgb = vec3(max(dot(eyeTangent, tbn[2] * tbn), 0.0));
	return;



	vec2 offsetTexture = vTexture + height * eyeTangent.xy;

	vec3 normal = normalize(texture2D(sNormalMap, offsetTexture).rgb * 2.0 - 1.0);
	normal = tbn * normal;



	float light = min(max(dot(normal, normalize(vec3(1))), 0.0) + 0.1, 1.0);
	vec3 color = texture2D(sDiffuseMap, offsetTexture).rgb;

	gl_FragColor.rgb = color * light;
	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
}

--- END ---


--- START ReliefMapping ---
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

varying vec3 vParallaxDirection;
varying vec3 vParallaxLight;



uniform vec3 uCameraLocation;
uniform mat3 uNormalMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionViewMatrix;


uniform vec3 uMirrorPosition;
uniform vec3 uMirrorNormal;
uniform int uMirror;

void main()
{
	gl_Position.xyz = aPosition;
	gl_Position.w = 1.0;
	gl_Position = uModelMatrix * gl_Position;

	if(uMirror == 1)
	{
		vec3 toMirror = (gl_Position.xyz - uMirrorPosition);
		gl_Position.xyz = gl_Position.xyz - 2.0 * dot(toMirror, uMirrorNormal) * uMirrorNormal;
	}

	vPosition = gl_Position.xyz;
	vTangent = uNormalMatrix * aTangent;
	vBitangnet = uNormalMatrix * aBitangent;
	vNormal = uNormalMatrix * aNormal;


	mat3 toTangent = mat3(vTangent, vBitangnet, vNormal);

	vParallaxDirection = (uCameraLocation - vPosition) * toTangent;
	vParallaxLight = normalize(vec3(1)) * toTangent;

	vTexture = aTexture;
	gl_Position = uProjectionViewMatrix * gl_Position;
}

---

precision highp float;

varying vec3 vPosition;
varying vec3 vTangent;
varying vec3 vBitangnet;
varying vec3 vNormal;
varying vec2 vTexture;

varying vec3 vParallaxDirection;
varying vec3 vParallaxLight;

#define NUM_SAMPLES 40

uniform float uHeightScale;

uniform sampler2D sHeightMap;
uniform sampler2D sNormalMap;
uniform sampler2D sDiffuseMap;



float cross2d(vec2 x, vec2 y)
{
	return x.x * y.y - x.y * y.x;
}


void main()
{
	mat3 tbn = mat3(
		normalize(vTangent),
		normalize(vBitangnet),
		normalize(vNormal)
		);

	vec3 parallaxDirection = normalize(vParallaxDirection);



	float limit = length(parallaxDirection.xy);
	limit *= uHeightScale;


	vec2 offset = (parallaxDirection.xy);
	vec2 maxOffset = offset * limit;

	float cRayHeight = uHeightScale;
	vec2 cOffset = vec2(0.0);
	vec2 lOffset = cOffset;
	float cSampleHeight = uHeightScale;
	float lSampleHeight = uHeightScale;
	float step = 1.0 / float(NUM_SAMPLES);

	for(int cSample = 0; cSample < NUM_SAMPLES; cSample++)
	{
		cSampleHeight = texture2D(sHeightMap, vTexture + cOffset).r * uHeightScale;
		if(cSampleHeight > cRayHeight)
		{
			float d1, d2;
			d1 = cSampleHeight - cRayHeight;
			d2 = (cRayHeight + step) - lSampleHeight;
			float r = d1 / (d1 + d2);
			cOffset = r * lOffset + (1.0 - r) * cOffset;
			break;
		}
		else
		{
			cRayHeight -= step * uHeightScale;
			lOffset = cOffset;
			cOffset += step * offset * uHeightScale;
			lSampleHeight = cSampleHeight;
		}
	}

	vec2 adjustedTexture = vTexture + cOffset;


	vec3 normal = texture2D(sNormalMap, adjustedTexture).rgb * 2.0 - 1.0;
	normal = normalize(tbn * normal);
	

	float light = min(max(dot(normal, normalize(vec3(1))), 0.0) + 0.1, 1.0);
	vec3 color = texture2D(sDiffuseMap, adjustedTexture).rgb;

	gl_FragColor.rgb = color * light;
	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));

	//gl_FragColor.rgb = vTangent * 0.5 + 0.5;
	//gl_FragColor.rgb = normalize( * tbn) * 0.5 + 0.5;


	//gl_FragColor.rgb = normal * 0.5 + 0.5;
}

--- END ---



