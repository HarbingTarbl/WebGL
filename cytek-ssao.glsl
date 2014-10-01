--- START GBuffer --- 
attribute vec3 vPostiion;
attribute vec3 vNormal;
attribute vec3 vTangent;
attribute vec3 vBitangent;
attribute vec2 vTexture;

uniform mat4 uPMatrix;
uniform mat3 uViewNormalMatrix;
uniform mat4 uMVMatrix;
uniform float uNear;
uniform float uFar;

varying mat3 fTbn;
varying vec2 fTexture;
varying float fLinearZ;

void main()
{
	vec4 p;
	p.xyz = vPostiion;
	p.w = 1.0;

	p = uMVMatrix * p;
	fLinearZ = clamp((p.z - uNear) / (uFar - uNear), 0.0, 1.0);
	gl_Position = uPMatrix * p;

	fTbn = mat3(vTangent, vBitangent, vNormal);
	fTbn = uViewNormalMatrix * fTbn;

	fTexture = vTexture;
}

---
#extension GL_EXT_draw_buffers : require
precision mediump float;

uniform sampler2D diffuse0;

varying mat3 fTbn;
varying vec2 fTexture;
varying float fLinearZ;

vec2 encodeNormals(vec3 normal)
{
	float p = sqrt(normal.z * 8.0 + 8.0);
	return vec2(normal.xy / p + 0.5);
}

vec2 encodeDepth(float depth)
{
	return vec2(depth, fract(depth * 255.0));
}


void main()
{
	gl_FragData[0].rgb = texture2D(diffuse0, fTexture).rgb;
	gl_FragData[1].rg = encodeNormals(fTbn[2]);
	gl_FragData[1].ba = encodeDepth(fLinearZ);
}

--- END ---




--- START SSAO ---
attribute vec4 vPosition;
attribute vec3 vViewRay;

varying vec2 fPosition;
varying vec2 fTexture;

void main()
{
	fPosition = vPosition.xy;
	fTexture = vPosition.xy * 0.5 + 0.5;
	gl_Position = vPosition;
}

---
precision mediump float;


varying vec2 fPosition;
varying vec2 fTexture;

uniform sampler2D sNormalDepthTex;
uniform sampler2D sNoiseTexture;

#define KERNEL_SIZE 16

uniform vec3 uKernel[KERNEL_SIZE];
uniform vec3 uLightDirection;
uniform float uKernelSize;
uniform float uNoiseScale;
uniform float uAmbientLight;
uniform mat4 uInverseVPMatrix;
uniform mat4 uVPMatrix;

//This is a screenspace technique, WTF am I doing it in a forward renderer.
//<-- Silly



void main()
{
	vec4 texND = texture2D(sNormalDepthTex, fTexture);
	vec3 normal = normalize(texND.rgb * 2.0 - 1.0);
	float depth = texND.a * 2.0 - 1.0;

	vec3 rotationVec = texture2D(sNoiseTexture, fTexture * uNoiseScale).rgb * 2.0 - 1.0;

	vec3 tangent = normalize(rotationVec - normal * dot(rotationVec, normal));
	vec3 bitangent = cross(tangent, normal);
	mat3 tbn = mat3(tangent, bitangent, normal);

	vec4 origin;
	origin.xy = fPosition;
	origin.z = depth;
	origin.w = 1.0;

	origin = uInverseVPMatrix * origin;
	origin.xyz /= origin.w;



	float occlusion = 0.0;
	for(int i = 0; i < KERNEL_SIZE; i++)
	{
		vec4 sample = vec4(tbn * uKernel[i], 1.0);
		sample.xyz = sample.xyz * uKernelSize + origin.xyz;


		vec4 offset = uVPMatrix * sample;
		offset.xy /= offset.w;
		offset.xy *= 0.5 + 0.5;

		float offsetDepth = texture2D(sNormalDepthTex, offset.xy).a;
		float range = (abs(origin.z - offsetDepth) < uKernelSize) ? 1.0 / float(KERNEL_SIZE) : 0.0;
		occlusion += range * (offsetDepth <= sample.z ? 1.0 / float(KERNEL_SIZE) : 0.0);
	}

	occlusion = 1.0 - occlusion;
	gl_FragColor = vec4(occlusion);
}


--- END ---







