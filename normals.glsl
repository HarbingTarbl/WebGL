--- START blank ---

attribute vec4 vPosition;

uniform mat4 uMVP;

void main(){
	gl_Position = uMVP* vPosition;
	
}

---

void main(){
	gl_FragColor = vec4(1, 0, 1, 1);
}

--- END ---