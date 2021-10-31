attribute vec4 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

uniform mat3 u_matrix;

void main() {
	gl_Position = vec4(u_matrix * a_position.xyz, 1);
	v_texcoord = a_texcoord;
}