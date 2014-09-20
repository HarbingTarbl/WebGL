--- START SponzaBlinn --- 

attribute vec3 vNormal;
attribute vec3 vPosition;
attribute vec3 vTangent;
attribute vec3 vBitangent;
attribute vec2 vTexture;

uniform mat4 uMVPMatrix;
uniform mat3 uNormalMatrix;

varying vec3 fNormal;
varying vec2 fTexture;

void main()
{
	gl_Position = uMVPMatrix * vec4(vPosition, 1.0);
	fNormal = uNormalMatrix * vNormal;
	fTexture = vTexture;
}

---

precision mediump float;

uniform sampler2D sAlbedo;
uniform sampler2D sSpecular;
uniform sampler2D sBump;

varying vec3 fNormal;
varying vec2 fTexture;

void main()
{
	vec3 tNormal = normalize(fNormal);
	vec4 albedo = texture2D(sAlbedo, fTexture);

	gl_FragColor.rgb = albedo.rgb;
	gl_FragColor.a = albedo.a;
}


--- END ---


--- START SSAO ---

attribute vec4 vPosition;

varying vec2 fTexture;

void main()
{
	gl_Position = vPosition;
	fTexture = vPosition.xy * 0.5 + 0.5;
	fTexture.y = 1.0 - fTexture.y;
}


---

precision mediump float;

uniform sampler2D sNormals;
uniform sampler2D sDepth;

void main()
{
	gl_FragColor = vec4(0);
}



--- END ---


--- START BilateralBlur ---

attribute vec4 vPosition;
varying vec2 fTexture;

void main()
{
	gl_Position = vPosition;
	fTexture = vPosition.xy * 0.5 + 0.5;
	fTexture.y = 1.0 - fTexture.y;
}


---

precision mediump float;

uniform sampler2D sDepth;

const  float spatialKernel[4] = float[4](
	1.0, 2.0, 3.0, 4.0);

const float valueKernel[4] = float[4](
	1.0, 2.0, 3.0, 4.0);


float gauss(float k)
{
	const float scale = 1.0;
	const float sigma = 1.0;
	const float sigsig = -2.0 * sigma * sigma;

	const float pi = 3.14159;

	const float d = 1.0 / (sigma * sqrt(2 * pi));


	return scale * exp((k * k / sigsig));
}

void main()
{
	gl_FragColor = vec4(0);

}

--- END ---
