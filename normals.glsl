--- depth packing
vec4 pack_depth(const in float depth)
{
    const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);
    const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
    vec4 res = fract(depth * bit_shift);
    res -= res.xxyz * bit_mask;
    return res;
}


--- varyings
varying vec3 vPosition;
varying vec2 vTexture;
varying vec3 vEyeTangent;
varying vec3 vLightTangent;

--- camera uniforms
uniform mat3 uNormalMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionViewMatrix;
uniform vec3 uCameraLocation;

---textures
uniform sampler2D sHeightMap;
uniform sampler2D sDiffuseMap;
uniform sampler2D sNormalMap;

--- height uniforms
uniform float uHeightScale;
uniform float uHeightBias;

--- common.frag
precision highp float;
#include varyings
#include textures
#include height uniforms

--- All.Vertex
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec3 aBitangent;
attribute vec2 aTexture;

#include varyings
#include camera uniforms

uniform vec3 uMirrorPosition;
uniform vec3 uMirrorNormal;
uniform int uMirror;

uniform vec3 uLightDir;

void main()
{
	gl_Position = vec4(aPosition, 1.0);
	gl_Position = uModelMatrix * gl_Position;

	vTexture = aTexture;
	vPosition = gl_Position.xyz;
	vec3 normal = normalize(uNormalMatrix * aNormal);
	vec3 tangent = normalize(uNormalMatrix * aTangent);
	vec3 bitangent = cross(normal, tangent);

	mat3 tbn = mat3(tangent, bitangent, normal);

	vEyeTangent = (uCameraLocation - vPosition) * tbn;
	vLightTangent = uLightDir * tbn;

	gl_Position = uProjectionViewMatrix * gl_Position;
}

---FlippyFloppyBlippyBloppy
	vec3 normal = normalize(texture2D(sNormalMap, offsetTexture).rgb) * 2.0 - 1.0;
	vec3 color = pow(texture2D(sDiffuseMap, offsetTexture).rgb, vec3(2.2));
	float NdL = max(dot(normal, normalize(vLightTangent)), 0.0);

	gl_FragColor.rgb = color * min(NdL + 0.0, 1.0);
	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));


--- NoMapping.Fragment
#include common.frag


void main()
{
	vec3 normal = vec3(0,0,1);

	vec3 color = pow(texture2D(sDiffuseMap, vTexture).rgb, vec3(2.2));
	float NdL = max(dot(normal, normalize(vLightTangent)), 0.0);


	gl_FragColor.rgb = color * min(NdL + 0.1, 1.0);
	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
}



--- NormalMapping.Fragment
#include common.frag

void main()
{	
	vec2 offsetTexture = vTexture;
	vec3 normal = normalize(texture2D(sNormalMap, offsetTexture).rgb) * 2.0 - 1.0;
	vec3 color = pow(texture2D(sDiffuseMap, offsetTexture).rgb, vec3(2.2));
	float NdL = max(dot(normal, normalize(vLightTangent)), 0.0);

	gl_FragColor.rgb = color * min(NdL + 0.0, 1.0);
	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
}


---ParallaxMapping.Fragment
#include common.frag

void main()
{
	float height = texture2D(sHeightMap, vTexture).r * uHeightScale + uHeightBias;

	vec3 eyeParallax = (vEyeTangent);

	vec2 offsetTexture = vTexture - (eyeParallax.xy / eyeParallax.z)* height;


#include FlippyFloppyBlippyBloppy



}


--- SteepParallax.Fragment
#include common.frag

#ifndef NUM_SAMPLES
#define NUM_SAMPLES 128
#endif

void main()
{
	vec2 eyeTangent = vEyeTangent.xy / vEyeTangent.z;

	float layerDelta = 1.0 / float(NUM_SAMPLES);


	vec2 texDelta = uHeightScale * eyeTangent * layerDelta;

	vec2 offsetTexture = vTexture;
	float textureHeight = texture2D(sHeightMap, vTexture).r;
	float layerHeight = 0.0;


	for(int i = 0; i < NUM_SAMPLES; i++)
	{
		if(layerHeight > textureHeight)
			break;


		layerHeight += layerDelta;
		offsetTexture -= texDelta;
		textureHeight = texture2D(sHeightMap, offsetTexture).r;
	}

#include FlippyFloppyBlippyBloppy
}


--- ReliefMapping.Fragment
#include common.frag

#ifndef NUM_SAMPLES
#define NUM_SAMPLES 32
#endif

#ifndef NUM_SEARCHES
#define NUM_SEARCHES 32
#endif

#define EPSILON 0.0001


#define SAMPLE_DELTA 1.0 / float(NUM_SAMPLES)

void main()
{
	vec2 viewRay = vEyeTangent.xy / vEyeTangent.z;
	vec2 deltaTexture = uHeightScale * viewRay * SAMPLE_DELTA;
	vec2 offsetTexture = vTexture;

	float currentHeight = texture2D(sHeightMap, offsetTexture).r;
	float currentLayer = 0.0;

	for(int i = 0; i < NUM_SAMPLES; i++)
	{
		if(currentLayer >= currentHeight)
			break;

		currentLayer += SAMPLE_DELTA;
		offsetTexture -= deltaTexture;
		currentHeight = texture2D(sHeightMap, offsetTexture).r;
	}

	vec2 dt = deltaTexture / 2.0;
	float dh = SAMPLE_DELTA / 2.0;
	offsetTexture += dt;
	currentHeight -= dh;

	for(int i = 0; i < NUM_SEARCHES; i++)
	{
		dt /= 2.0;
		dh /= 2.0;

		currentHeight = texture2D(sHeightMap, offsetTexture).r;

		if(currentHeight > currentLayer)
		{
			offsetTexture -= dt;
			currentHeight += dh;
		}
		else
		{
			offsetTexture += dt;
			currentHeight -= dh;
		}
	}


	#include FlippyFloppyBlippyBloppy
}


