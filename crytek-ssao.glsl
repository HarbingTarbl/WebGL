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
	fLinearZ = clamp((-p.z - uNear) / (uFar - uNear), 0.0, 1.0);
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
	//gl_FragColor = texture2D(diffuse0, fTexture);
	gl_FragData[0].rgb = texture2D(diffuse0, fTexture).rgb;
	gl_FragData[1].rg = encodeNormals(fTbn[2]);
	gl_FragData[1].ba = encodeDepth(fLinearZ);
	//gl_FragColor = vec4(fLinearZ);
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

uniform sampler2D sNormalDepthTex;
uniform sampler2D sNoiseTexture;

#define KERNEL_SIZE 16

uniform vec3 uKernel[KERNEL_SIZE];
uniform float uKernelSize;
uniform float uNoiseScale;
uniform mat4 uInverseVPMatrix;
uniform mat4 uVPMatrix;

uniform float uFar;

uniform vec2 uScreenSize;


//This is a screenspace technique, WTF am I doing it in a forward renderer.
//<-- Silly


//Everything in WebGL is a HUGE pain in the ass.
//Doing even simple things (storing depth in a non-FP format) is a GIGANTIC HASSLE

vec3 decodeNormal(vec2 enc)
{
    vec2 fenc = enc*4.0-2.0;
    float f = dot(fenc,fenc);
    float g = sqrt(1.0-f/4.0);
    vec3 n;
    n.xy = fenc*g;
    n.z = 1.0-f/2.0;
    return n;
}

float decodeDepth(vec2 depth)
{
	return depth.x + depth.y / 255.0;
}

vec4 texure2DLerpNormalDepth(vec2 texcoord)
{
    // texel size, fractional position and centroid UV
    vec2 tex = 1.0/uScreenSize;
    vec2 f = fract(texcoord*uScreenSize+0.5);
    vec2 uv = floor(texcoord*uScreenSize+0.5)/uScreenSize;

    // lookup the 4 corners
    vec4 lb = texture2D(sNormalDepthTex, uv);
    lb = vec4(decodeNormal(lb.rg).xyz, decodeDepth(lb.ba));
    vec4 lt = texture2D(sNormalDepthTex, uv+vec2(0.0, tex.y));
    lt = vec4(decodeNormal(lt.rg), decodeDepth(lt.ba));
    vec4 rb = texture2D(sNormalDepthTex, uv+vec2(tex.x, 0.0));
    rb = vec4(decodeNormal(rb.rg), decodeDepth(rb.ba));
    vec4 rt = texture2D(sNormalDepthTex, uv+vec2(tex.y, tex.y));
    rt = vec4(decodeNormal(rt.rg), decodeDepth(rt.ba));

    // interpolation in y
    vec4 a = mix(lb, lt, f.y);
    vec4 b = mix(rb, rt, f.y);

    // interpolation in x
    return mix(a, b, f.x);
}

float texture2DLerpDepth(vec2 texcoord)
{
	vec2 tex = 1.0/uScreenSize;
    vec2 f = fract(texcoord*uScreenSize+0.5);
    vec2 uv = floor(texcoord*uScreenSize+0.5)/uScreenSize;

    // lookup the 4 corners
    vec2 lb = texture2D(sNormalDepthTex, uv).ba;
    lb.r = decodeDepth(lb);
    vec2 lt = texture2D(sNormalDepthTex, uv+vec2(0.0, tex.y)).ba;
    lt.r = decodeDepth(lt);
    vec2 rb = texture2D(sNormalDepthTex, uv+vec2(tex.x, 0.0)).ba;
    rb.r = decodeDepth(rb);
    vec2 rt = texture2D(sNormalDepthTex, uv+vec2(tex.x, tex.y)).ba;
    rt.r = decodeDepth(rt);

    // interpolation in y
    float a = mix(lb.r, lt.r, f.y);
    float b = mix(rb.r, rt.r, f.y);

    // interpolation in x
    return mix(a, b, f.x);
}


void main()
{
	vec4 texND = texure2DLerpNormalDepth(fTexture);

	vec3 normal = normalize(texND.xyz);
	float depth = texND.w * uFar;

	vec3 rotation = normalize(texture2D(sNoiseTexture, fTexture * uNoiseScale).rgb * 2.0 - 1.0);

	vec3 tangent = normalize(rotationVec - normal * dot(rotationVec, normal));
	vec3 bitangent = cross(tangent, normal);
	mat3 tbn = mat3(tangent, bitangent, normal);


	vec4 origin = vec4(fViewRay * depth, 1.0);

	float occlusion = 0.0;
	for(int i = 0; i < KERNEL_SIZE; i++)
	{
		vec4 sample = vec4(tbn * uKernel[i], 1.0);
		sample.xyz = sample.xyz * uKernelSize + origin.xyz;


		vec4 offset = uVPMatrix * sample;
		offset.xy /= offset.w;
		offset.xy *= 0.5 + 0.5;

		float offsetDepth = texture2DLerpDepth(offset);
		float range = (abs(depth - offsetDepth) < uKernelSize) ? 1.0 / float(KERNEL_SIZE) : 0.0;
		occlusion += range * (offsetDepth <= sample.z ? 1.0 / float(KERNEL_SIZE) : 0.0);
	}

	occlusion = 1.0 - occlusion;
	gl_FragColor = vec4(occlusion);
}


--- END ---







