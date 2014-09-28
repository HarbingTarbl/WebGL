


--- START Depth ---

attribute vec3 vPosition;

uniform mat4 uMVPMatrix;
void main()
{
	gl_Position = uMVPMatrix * vec4(vPosition, 1.0);
}

---

void main()
{
	gl_FragColor = vec4(0);
}

--- END ---



--- START DLDO ---

uniform mat4 uMVPMatrix;
uniform mat3 uNormalMatrix;

attribute vec3 vPosition;
attribute vec3 vNormal;
attribute vec2 vTexture;

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

uniform vec3 uLightColor;
uniform float uAmbientIntensity;
uniform float uLightIntensity;
uniform vec3 uLightDirection;


uniform sampler2D diffuse0;
uniform sampler2D normal0;

varying vec3 fNormal;
varying vec2 fTexture;

void main()
{
	vec3 tNormal = normalize(fNormal);

    vec3 diffuseTerm = 
    	uLightIntensity * 
    	uLightColor * 
    	pow(texture2D(diffuse0, fTexture).rgb, vec3(1.0 / 2.2)) * 
    	(clamp(dot(tNormal, uLightDirection), 0.0, 1.0) + uAmbientIntensity);

	gl_FragColor.rgb = clamp(pow(diffuseTerm, vec3(2.2 / 1.0)), vec3(0.0), vec3(1.0));
}

--- END ---




--- START ParallaxMapping ---

attribute vec3 vPosition;
attribute vec3 vNormal;
attribute vec2 vTexture;
attribute vec3 vTangent;
attribute vec3 vBitangent;

uniform mat4 uMVPMatrix;
uniform mat3 uNormalMatrix;

void main()
{
	gl_Position = uMVPMatrix * vec4(vPosition, 1.0);
	
} 

---


void main()
{



}


--- END ---
