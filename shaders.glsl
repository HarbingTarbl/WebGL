


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


--- START OnlySpecular ---
attribute vec3 vPosition;
attribute vec3 vNormal;

varying vec3 fNormal;

uniform mat4 uMVPMatrix;
uniform mat3 uNormalMatrix;

void main()
{
	gl_Position = uMVPMatrix * vec4(vPosition, 1.0);
	fNormal = uNormalMatrix * vNormal;
}


---

precision mediump float;

uniform vec3 uViewerPosition;
uniform vec3 uAmbientColor;
uniform mediump float uSpecularPower;

void main()
{
	gl_FragColor = vec4(uAmbientColor, 1.0);
}


--- END ---



--- START DLDO ---

uniform mat4 uMVPMatrix;
uniform mat3 uNormalMatrix;

attribute vec3 vPosition;
attribute vec3 vNormal;

varying vec3 fNormal;

void main()
{
	gl_Position = uMVPMatrix * vec4(vPosition, 1.0);
	fNormal = uNormalMatrix * vNormal;
}

---

precision mediump float;

uniform vec3 uColor;
uniform vec3 uLightDirection;

varying vec3 fNormal;

void main()
{
	vec3 tNormal = normalize(fNormal);

    vec3 diffuseTerm = uColor * (clamp(dot(tNormal, uLightDirection), 0.0, 1.0) + 0.2);




	gl_FragColor.rgb = clamp(pow(diffuseTerm , vec3(1.0 / 2.2)), vec3(0.0), vec3(1.0));
}

--- END ---
