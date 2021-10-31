attribute vec4 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

uniform mat4 u_matrix;

void main() {
	gl_Position = u_matrix * a_position;
	v_texcoord = a_texcoord;
}