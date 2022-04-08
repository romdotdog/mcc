attribute vec4 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

void main() {
	gl_Position = vec4(a_position.xy, 1, 1);
	v_texcoord = a_texcoord;
}