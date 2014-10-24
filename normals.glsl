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
varying vec3 vTangent;
varying vec3 vBitangnet;
varying vec3 vNormal;
varying vec2 vTexture;
varying vec3 vEye;

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

void main()
{
	gl_Position = vec4(aPosition, 1.0);
	gl_Position = uModelMatrix * gl_Position;

	vTexture = aTexture;
	vPosition = gl_Position.xyz;
	vNormal = uNormalMatrix * aNormal;
	vTangent = uNormalMatrix * aTangent;
	vBitangnet = uNormalMatrix * aBitangent;


	vEye = (uCameraLocation - vPosition) * mat3(vTangent, vBitangnet, vNormal);
	
	gl_Position = uProjectionViewMatrix * gl_Position;
}


--- NoMapping.Fragment
#include common.frag


void main()
{
	vec3 normal = normalize(vNormal);
	gl_FragColor.rgb = vec3(min(max(dot(normal, normalize(vec3(1))), 0.0) + 0.1, 1.0));
	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
}



--- NormalMapping.Fragment
#include common.frag

void main()
{
	mat3 tbn = mat3(normalize(vTangent), normalize(vBitangnet), normalize(vNormal));
	vec3 normal = normalize(texture2D(sNormalMap, vTexture)) * 2.0 - 1.0;

	gl_FragColor.rgb = (tbn * normal).rgb * 0.5 + 0.5;
}


---ParallaxMapping.Fragment
#include common.frag

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


--- ReliefMapping.Fragment
#ifndef NUM_SAMPLES
#define NUM_SAMPLES 32
#endif
#include common.frag

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

	vec3 parallaxDirection = normalize(vEye);



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

