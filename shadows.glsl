
--- DrawTQuad.Vertex
attribute vec2 aPosition;

uniform vec2 uPosition;
uniform vec2 uScale;
uniform vec2 uScreen;

varying vec2 vTexture;

void main()
{
	gl_Position = vec4((aPosition * uScale + uPosition) * uScreen - 1.0, 0, 1);
	vTexture = aPosition;
}

--- DrawTQuad.Frag
precision mediump float;
uniform sampler2D sTexture;

varying vec2 vTexture;

void main()
{
	gl_FragColor = texture2D(sTexture, vTexture).rrrr;
}

--- DrawModel.Vertex
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexture;

uniform mat4 uLightViewProjection;
uniform mat4 uViewProjection;
uniform mat4 uModel;

varying vec3 vWorld;

varying vec3 vNormal;
varying vec2 vTexture;
varying vec2 vShadowTexture;

void main()
{
	vNormal = (uModel * vec4(aNormal, 0.0)).xyz;
	vec4 gPos = uModel * vec4(aPosition, 1.0);
	vWorld = gPos.xyz;
	gl_Position = uViewProjection * gPos;
	vTexture = aTexture;
	gPos = (uLightViewProjection * gPos);
	gPos.xy /= gPos.w;
	vShadowTexture = gPos.xy * 0.5 + 0.5;
}


--- DrawModel.Frag
precision highp float;
uniform sampler2D sDiffuse;
uniform sampler2D sShadow;

uniform vec3 uLightPosition;
uniform mat4 uLightIViewProjection;
uniform mat4 uLightViewProjection;

varying vec2 vShadowTexture;
varying vec2 vTexture;
varying vec3 vWorld;
varying vec3 vNormal;

void main()
{
	vec4 proj = uLightViewProjection * vec4(vWorld, 1.0);
	proj.xyz /= proj.w;
	proj.xyz = proj.xyz * 0.5 + 0.5;
	float shadowZ = texture2D(sShadow, proj.xy).r + 0.001;

	//vec3 toLight = normalize(uLightPosition); //Doing this in the FS, sooooo bad.
	//float NdL = max(dot(toLight, vNormal), 0.0);

	float inShadow = min(float(proj.z < shadowZ) + 0.4, 1.0);


	gl_FragColor = texture2D(sDiffuse, vTexture) * inShadow;
}


--- CreateShadow.Vertex
attribute vec3 aPosition;

uniform mat4 uViewProjection;
uniform mat4 uModel;

varying vec3 vWorld;

void main()
{
	gl_Position = uModel * vec4(aPosition, 1.0);
	vWorld = gl_Position.xyz;
	gl_Position = uViewProjection * gl_Position;
}


--- CreateShadow.Frag
precision highp float;
varying vec3 vWorld;

void main()
{
	gl_FragColor = vec4(1); //Using Post-Projection depth anyway soooo
}

--- CreateLight.Vertex
attribute vec3 aPosition;

uniform mat4 uViewProjection;
uniform mat4 uModel;

void main()
{

}


--- CreateLight.Frag

void main()
{

}