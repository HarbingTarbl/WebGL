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


varying vec3 fPosition;
varying vec3 fNormal;
varying vec2 fTexture;
varying float fLinearZ;

void main()
{
	vec4 p;
	p.xyz = vPostiion;
	p.w = 1.0;



	p = uMVMatrix * p;
	fLinearZ = - p.z / uFar;
	gl_Position = uPMatrix * p;
	fNormal = uViewNormalMatrix * vNormal;
	fPosition = uViewNormalMatrix * vPostiion;
	fTexture = vTexture;
}

---
#extension GL_EXT_draw_buffers : require
#extension GL_OES_standard_derivatives : require
precision mediump float;

uniform sampler2D diffuse0;
uniform sampler2D height0;
uniform float specularPower;
uniform float shininess;
uniform float uBumpScale;

varying vec3 fNormal;
varying vec2 fTexture;
varying float fLinearZ;
varying vec3 fPosition;

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
	gl_FragData[0].a = specularPower;

	vec3 normal;
	if(uBumpScale > 0.1){
		vec3 SigmaS = dFdx(fPosition);
		vec3 SigmaT = dFdy(fPosition);
		vec3 vN = normalize(fNormal);
		vec3 vR1 = cross(SigmaT, vN);
		vec3 vR2 = cross(vN, SigmaS);
		float det = dot(SigmaS, vR1);
		float height = texture2D(height0, fTexture).r * uBumpScale;
		float Bs = dFdx(height);
		float Bt = dFdy(height);
		vec3 Surf = sign(det) * (Bs * vR1  + Bt * vR2);
		normal = normalize(abs(det) * vN - Surf);
	}
	else {
		normal = normalize(fNormal);
	}
	gl_FragData[1].rgb = normal * 0.5 + 0.5;
	gl_FragData[1].a = shininess;
}

--- END ---




--- START SSAO ---
attribute vec4 vPosition;
attribute vec3 vViewRay;

varying vec2 fPosition;
varying vec2 fTexture;
varying vec3 fViewRay;

void main()
{
	fPosition = vPosition.xy;
	fTexture = vPosition.xy * 0.5 + 0.5;
	fViewRay = vViewRay;
	gl_Position = vPosition;
}


---
precision mediump float;


varying vec2 fPosition;
varying vec2 fTexture;
varying vec3 fViewRay;

uniform sampler2D sDiffuseTex;
uniform sampler2D sNormalDepthTex;
uniform sampler2D sNoiseTexture;
uniform sampler2D sProjectedDepthTexture;

#define KERNEL_SIZE 16

uniform vec3 uKernel[KERNEL_SIZE];
uniform float uKernelSize;
uniform float uNoiseScale;

uniform mat4 uInversePMatrix;
uniform mat4 uPMatrix;
uniform float uFar;
uniform vec2 uScreenSize;


//Everything in WebGL is a HUGE pain in the ass.
//Doing even simple things (storing depth in a non-FP format) is a GIGANTIC HASSLE


void main()
{
	vec4 texND = texture2D(sNormalDepthTex, fTexture);

	vec3 normal = normalize(texND.xyz * 2.0 - 1.0); //[0, 1] -> [-1, 1]
	float depth = texture2D(sProjectedDepthTexture, fTexture).r * 2.0 - 1.0; //[0, 1] -> [-1, 1]

	vec3 rotation = normalize(texture2D(sNoiseTexture, fTexture * uNoiseScale).rgb * 2.0 - 1.0);
	rotation.z = 0.0;

	vec3 tangent = normalize(rotation - normal * dot(rotation, normal));
	vec3 bitangent = cross(normal, tangent);
	mat3 tbn = mat3(tangent, bitangent, normal);

	vec4 origin = vec4(fPosition, depth, 1.0);
	origin = uInversePMatrix * origin;
	origin.xyz /= origin.w;

	float occlusion = 0.0;
	vec4 sample;
	for(int i = 0; i < KERNEL_SIZE; i++)
	{
		sample = vec4(tbn * uKernel[i], 1.0);
		sample.xyz = sample.xyz * uKernelSize + origin.xyz;

		vec4 offset = uPMatrix * sample;
		offset.xyz /= offset.w;
		offset.xyz = offset.xyz * 0.5 + 0.5; //[-1, 1] -> [0, 1]

		float offsetDepth = texture2D(sProjectedDepthTexture, offset.xy).r; //[0, 1]

		float range = (abs(depth - offsetDepth) < uKernelSize) ? 1.0 : 0.0;
		occlusion += range * (offsetDepth <= offset.z ? 1.0 : 0.0);
	}

	occlusion = 1.0 - occlusion / float(KERNEL_SIZE);
	//gl_FragColor = vec4(abs(fViewRay / 1048.0), 1.0);
	//gl_FragColor = vec4(normalize(uKernel[0]).xyz * 0.5 + 0.5, 1.0);
	gl_FragColor = vec4(occlusion);
}


--- END ---


--- START Blur ---
attribute vec4 vPosition;

varying vec2 fTexture;

void main()
{
	fTexture = vPosition.xy;
	fTexture = fTexture * 0.5 + 0.5;
	gl_Position = vPosition;
}

---
precision mediump float;
varying vec2 fTexture;

uniform sampler2D sInputTexture;
uniform vec2 uSampleDirection;

/// 3x3 Kernel

void main()
{
	float v1 = texture2D(sInputTexture, fTexture + uSampleDirection * 0.6667).r;
	float v2 = texture2D(sInputTexture, fTexture - uSampleDirection * 0.6667).r;


	gl_FragColor = vec4((v1 + v2) * 0.5);
}
--- END ---







