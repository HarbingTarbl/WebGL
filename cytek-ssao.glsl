--- START LinearDepth ---
attribute vec3 vPosition;

uniform mat4 uMVPMatrix;
uniform mat4 uMVMatrix;

uniform float uNear;
uniform float uFar;

varying float fLinearZ;

void main()
{
	vec4 p;
	p.xyz = vPosition;
	p.w = 1.0;
	gl_Position = uMVPMatrix * p;
	fLinearZ = (uMVMatrix * p).z;
}

---

precision mediump float;

varying float fLinearZ;

void main()
{
	gl_FragColor.rgb = vec3(fLinearZ);
}

--- END ---

--- START SSAO ---

attribute vec3 vPosition;
attribute vec3 vNormal;
attribute vec3 vTangent;
attribute vec3 vBitangent;
attribute vec2 vTexture;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec3 fTangent;
varying vec3 fBitangent;
varying vec2 fTexture;

uniform mat4 uVPMatrix;
uniform mat4 uMMatrix;
uniform mat3 uNormalMatrix;


void main()
{
	vec4 p;
	p.xyz = vPosition;
	p.w = 1.0;

	p = uMMatrix * p;
	fPosition = p.xyz;
	gl_Position = uVPMatrix * p;

	fNormal = uNormalMatrix * vNormal;
	fTangent = uNormalMatrix * vTangent;
	fBitangent = uNormalMatrix * fBitangent;

	fTexture = vTexture;
}

---
precision mediump float;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec3 fTangent;
varying vec3 fBitangent;
varying vec2 fTexture;

uniform sampler2D diffuse0;
uniform sampler2D linearDepth;
uniform sampler2D rotationTex;

#define KERNEL_SIZE 16

uniform vec3 kernel[KERNEL_SIZE];
uniform vec3 lightDirection;
uniform float kernelSize;
uniform float noiseScale;
uniform float ambientLight;
uniform vec3 viewRay;
uniform mat4 PMatrix;
uniform mat4 InvPMatrix;
//This is a screenspace technique, WTF am I doing it in a forward renderer.
//<-- Silly



void main()
{
	vec3 normal = normalize(fNormal);
	vec3 rotationVec = texture2D(rotationTex, gl_FragCoord.xy * noiseScale).rgz * 2.0 - 1.0;
	vec3 tangent = normalize(rotationVec - normal * dot(rotationVec, normal));
	vec3 bitangent = cross(tangent, bitangent);
	mat3 tbn = mat3(tangent, bitangent, normal);

	vec3 origin;
	origin.xy = gl_FragCoord.xy;


	float occlusion = 0.0;
	for(int i = 0; i < KERNEL_SIZE; i++)
	{
		vec3 sample = tbn * kernel[i];
		sample = sample * kernelSize + origin;

		vec4 offset = PMatrix * vec4(sample, 1.0);
		offset.xy /= offset.w;
		offset.xy *= 0.5 + 0.5;

		float depth = texture2D(linearDepth, offset).r;
		float range = (abs(origin.z - depth) < kernelSize) ? 1.0 / KERNEL_SIZE : 0.0;
		occlusion += range * (depth <= sample.z ? 1.0 / KERNEL_SIZE : 0.0);
	}

	occlusion = 1.0 - occlusion;

	float NdL = max(dot(normal, lightDirection), 0.0);
	vec3 diffuseColor = pow(texture2D(diffuse0, fTexture).rgb, vec3(1.0 / 2.2));

	vec3 diffuseTerm = NdL * diffuseColor;


	gl_FragColor = clamp(pow(diffuseTerm, vec3(2.2 / 1.0)), vec3(0.0), vec3(1.0));
}


--- END ---







