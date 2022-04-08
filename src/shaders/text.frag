precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;

void main() {
	gl_FragColor = mix(vec4(1, 1, 1, 1), vec4(0, 0, 0, 1), texture2D(u_texture, v_texcoord).w);
}