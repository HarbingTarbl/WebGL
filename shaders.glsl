---- Start SSAOMixer ---

attribute vec4 vPosition;

varying vec2 fTexture;


void main()
{
	gl_Position = vPosition;
	fTexture = vPosition.xy * 0.5 + 0.5;
}

----
varying vec2 fTexture;

uniform sampler2D ssaoInput;
uniform sampler2D sceneInput;

void main()
{
	float ssao = texture2D(ssaoInput, fTexture).r;
	vec4 scene = texture2D(sceneInput, fTexture);


	gl_FragColor.rgb = scene.rgb * min(ssao + scene.a, 1.0);




}


--- END ---