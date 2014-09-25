--- START Fluid ---

attribute vec4 vPosition;

varying vec2 fTexture;

void main()
{
	gl_Position = vPosition;
	fTexture = vPosition.xy;
	fTexture.y = 1.0 - fTexture.y;
}

---

uniform float timeScale;



vec4 advect(sampler2D velocityMap, sampler2D quantityMap, vec2 point)
{
	vec2 k = point - timeScale * texture2D(velocityMap, point).rg;
	return texture2D(quantityMap, k);
}






//point should be in normalized
vec2 gradiant(sampler2D texture, vec2 point, vec2 dx, vec2 dy)
{
	float x1 = texture2D(texture, point + dx).r;
	float x2 = texture2D(texture, point - dx).r;
	float y1 = texture2D(texture, point + dy).r;
	float y2 = texture2D(texture, point - dx).r;
	return vec2(x1 - x2, y1 - y2) * 0.5;
}


float divergence(sampler2D texture, vec2 point, vec2 dx, vec2 dy)
{
	float x1 = texture2D(texture, point + dx).r;
	float x2 = texture2D(texture, point - dx).r;
	float y1 = texture2D(texture, point + dy).g;
	float y2 = texture2D(texture, point - dy).g;

	return ((x1 - x2) + (y1 - y2)) * 0.5;
}

float laplace(sampler2D texture, vec2 point, vec2 dx, vec2 dy)
{
	float c = texture2D(texture, point).r;
	float x1 = texture2D(texture, point + dx).r;
	float x2 = texture2D(texture, point - dx).r;
	float y1 = texture2D(texture, point + dy).r;
	float y2 = texture2D(texture, point - dy).r;


	return (x1 + x2 + y1 + y2 - 4 * c);
}


float posPressure(sampler2D pressureMap, vec2 point, float tex, float diver, float dx, float b)
{
	vec2 ddx = vec2(tex, 0.0);
	vec2 ddy = vec2(0.0, tex);

	float x1 = texture2D(pressureMap, point + ddx).r;
	float x2 = texture2D(pressureMap, point - ddx).r;
	float y1 = texture2D(pressureMap, point + ddy).r;
	float y2 = texture2D(pressureMap, point - ddy).r;

	float n = x1 + x2 + y1 + y2 + dx * diver;
	return n / 4.0;
}


