--- START LightPass ---

attribute vec3 vPosition;
attribute float vAtten;
attribute vec3 vDirection;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uViewNormalMatrix;
varying vec2 fTexture;
varying float fAtten;
varying vec3 fDirection;
varying vec3 fPosition;


void main()
{
	gl_Position = uMVMatrix * vec4(vPosition, 1.0);
	fPosition = gl_Position.xyz;
	fAtten = vAtten;
	fDirection = uViewNormalMatrix * vDirection;
	fTexture = gl_Position.xy / gl_Position.w;
	fTexture = fTexture * 0.5 + 0.5;
	gl_Position = uPMatrix * gl_Position;
}

---

varying float fAtten;
varying vec3 fDirection;

uniform float uAttenMod;
uniform sampler2D sNormalBuffer;

void main()
{
	vec4 tex = texture2D(sNormalBuffer, fTexture);
	vec3 normal = normalize(tex.xyz * 2.0 - 1.0);
	vec3 direction = normalize(fDirection);



	float nDl = max(dot(normal, direction), 0.0);
	gl_FragColor.r = (nDl / fAtten) * uAttenMod;
	vec3 half = normalize(direction + normalize(fPosition));
	float nDh = max(dot(normal, half), 0.0);
	gl_FragColor.g = (pow(nDh, tex.w) / fAtten) * uAttenMod;
	
}


--- END ---