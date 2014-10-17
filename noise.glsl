--- START ColorNoise ---
attribute vec4 aPosition;

varying vec2 vPosition;
varying vec2 vTexture;

void main()
{
	gl_Position = aPosition;
	vPosition = gl_Position.xy;
	vTexture = vPosition * 0.5 + 0.5;
}

---

uniform vec3 uColor;
uniform float uNoiseScale;
uniform vec2 uTexelScale;

void main()
{
	gl_FragData = vec4(0);

}

--- END ---