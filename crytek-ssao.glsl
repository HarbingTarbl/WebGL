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
varying vec3 fViewPosition;

void main()
{
	vec4 p;
	p.xyz = vPostiion;
	p.w = 1.0;

	p = uMVMatrix * p;
	fViewPosition = p.xyz;

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
uniform sampler2D specular0;

uniform float specularPower;
uniform float lambertPower;
uniform float shininess;
uniform float uBumpScale;

//Don't got time for a fullblown deferred shading!
//GET SOME HYBRID RENDERAN WOO WOO


#define MAX_POINT_LIGHTS 5
uniform vec3 uPointLightPosition[MAX_POINT_LIGHTS];
uniform vec3 uPointLightColor[MAX_POINT_LIGHTS];
uniform float uPointLightRadius[MAX_POINT_LIGHTS];
uniform float uPointLightCutoff[MAX_POINT_LIGHTS];
uniform float uPointLightPower[MAX_POINT_LIGHTS];

#define MAX_SPOT_LIGHTS 1
uniform vec3 uSpotLightPosition[MAX_SPOT_LIGHTS];
uniform vec3 uSpotLightDirection[MAX_SPOT_LIGHTS];
uniform vec3 uSpotLightAngle[MAX_SPOT_LIGHTS];
uniform vec3 uSpotLightColor[MAX_SPOT_LIGHTS];
uniform vec2 uSpotLightAttenuation[MAX_SPOT_LIGHTS];

#define MAX_DIRECTIONAL_LIGHTS 1
uniform vec3 uDirectionalLightDirections[MAX_DIRECTIONAL_LIGHTS];
uniform vec4 uDirectionalLightColors[MAX_DIRECTIONAL_LIGHTS];

varying vec3 fNormal;
varying vec2 fTexture;
varying float fLinearZ;
varying vec3 fPosition;
varying vec3 fViewPosition;

vec2 encodeNormals(vec3 normal)
{
	float p = sqrt(normal.z * 8.0 + 8.0);
	return vec2(normal.xy / p + 0.5);
}

vec2 encodeDepth(float depth)
{
	return vec2(depth, fract(depth * 255.0));
}


float attenuate(vec3 lpos, float radius, float cutoff)
{
	vec3 L = lpos - fViewPosition;
	float dist = length(L);
	float d = max(dist - radius, 0.0);
	L /= dist;

	float denom = d / radius + 1.0;
	float atten = 1.0 / (denom * denom);
	atten = (atten - cutoff) / (1.0 - cutoff);
	return max(atten, 0.0);
}


void main()
{
	vec3 normal;
	if(uBumpScale > 0.2){
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

	vec3 position = normalize(fViewPosition);
	vec3 albedo = texture2D(diffuse0, fTexture).rgb;
	albedo = pow(albedo, vec3(1.0 / 2.2)); //Gamma Correction!

	vec3 lambertColor = vec3(0.0);
	vec3 specularColor = vec3(0.0);
	float affectingLight = 0.0;


	for(int i = 0; i < MAX_POINT_LIGHTS; i++)
	{
		if(uPointLightPower[i] <= 0.001){
			continue;
		}

		vec3 L = uPointLightPosition[i] - fViewPosition;
		float dist = length(L);
		float d = max(dist - uPointLightRadius[i], 0.0);
		L /= dist;

		float denom = d / uPointLightRadius[i] + 1.0;
		float atten = 1.0 / (denom * denom);
		atten = (atten - uPointLightCutoff[i]) / (1.0 - uPointLightCutoff[i]);
		atten = max(atten, 0.0) * uPointLightPower[i];

		float NdL = max(dot(normal, L), 0.0) * atten;
		

		lambertColor += NdL * uPointLightColor[i];
		if(NdL > 0.001)
		{
			vec3 H = normalize(L - position);
			float NdH = max(dot(normal, H), 0.0);
			specularColor += atten * pow(NdH, shininess) * uPointLightColor[i];
		}
	}

	for(int i = 0; i < MAX_SPOT_LIGHTS; i++)
	{
		float power = uSpotLightAngle[i].z;
		if(power <= 0.001){
			continue;
		}

		vec3 L = uSpotLightPosition[i] - fViewPosition;
		float dist = length(L);
		float d = max(dist - uSpotLightAttenuation[i].x, 0.0);
		L /= dist;

		float denom = d / uSpotLightAttenuation[i].x + 1.0;
		float atten = 1.0 / (denom * denom);
		atten = (atten - uSpotLightAttenuation[i].y) / (1.0 - uSpotLightAttenuation[i].y);
		atten = max(atten, 0.0) * power;


		float angle = dot(-L, uSpotLightDirection[i]);
		float cone = smoothstep(uSpotLightAngle[i].x, uSpotLightAngle[i].y, angle);

		atten *= cone;

		float NdL = max(dot(normal, L), 0.0) * atten;
		lambertColor += NdL * uSpotLightColor[i];
		
		if(NdL > 0.001){
			vec3 H = normalize(L - position);
			float NdH = max(dot(normal, H), 0.0);
			specularColor += atten * pow(NdH, shininess) * uSpotLightColor[i];
		}

	}

	for(int i = 0; i < MAX_DIRECTIONAL_LIGHTS; i++)
	{

	}

	float specularCoef = texture2D(specular0, fTexture).r;

	affectingLight = min(affectingLight, 1.0);	
	vec4 affectingColor = min(vec4((lambertPower * lambertColor + specularCoef * specularPower * specularColor) * albedo, affectingLight), vec4(1.0));
	affectingColor.xyz = pow(affectingColor.xyz, vec3(2.2));
	affectingColor.w = 1.0 - affectingColor.w;

	gl_FragData[0] = affectingColor;
	//gl_FragData[0].xyz = albedo;
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







