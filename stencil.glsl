
---camera
uniform mat4 uProjectionViewMatrix;
uniform mat4 uModelMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 uCameraLocation;

---direct light
uniform vec3 uLightDir;
uniform vec3 uLightColor;

---varyings
varying vec2 vTexture;
varying vec3 vNormal;


---Vertex
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexture;

#include camera
#include varyings


void main()
{
	gl_Position = uModelMatrix * vec4(aPosition, 1.0);
	vNormal = uNormalMatrix * aNormal;
	vTexture = aTexture;
	vTexture.y = 1.0 - vTexture.y;
	gl_Position = uProjectionViewMatrix * gl_Position;
}

---Fragment
precision highp float;
uniform sampler2D sDiffuseMap;
#include varyings
#include direct light
#include camera


void main()
{
	vec3 color = pow(texture2D(sDiffuseMap, vTexture).rgb, vec3(2.2));
	float NdL = max(dot(vNormal, uLightDir), 0.0);

	gl_FragColor.rgb = color * min(NdL + 0.2, 1.0);
	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
}
