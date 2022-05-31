precision mediump float;

const vec4 foreground = vec4(1.0, 1.0, 1.0, 1.0);
const vec4 outline = vec4(0.0, 0.0, 0.0, 1.0);

uniform float u_offset_x;
uniform float u_offset_y;

varying vec2 v_texcoord;
uniform sampler2D u_texture;

// adapted from https://gist.github.com/xoppa/33589b7d5805205f8f08?permalink_comment_id=3613584#gistcomment-3613584
void main() {
	float init_alpha = texture2D(u_texture, v_texcoord).a;
	
	float alpha = 0.0;
    alpha += (1.0 - alpha) * texture2D(u_texture, v_texcoord + vec2(0.0, u_offset_y)).a;
    alpha += (1.0 - alpha) * texture2D(u_texture, v_texcoord + vec2(-u_offset_x, u_offset_y)).a;
    alpha += (1.0 - alpha) * texture2D(u_texture, v_texcoord + vec2(-u_offset_x, 0.0)).a;
    alpha += (1.0 - alpha) * texture2D(u_texture, v_texcoord + vec2(-u_offset_x, -u_offset_y)).a;
    alpha += (1.0 - alpha) * texture2D(u_texture, v_texcoord + vec2(0.0, -u_offset_y)).a;
    alpha += (1.0 - alpha) * texture2D(u_texture, v_texcoord + vec2(u_offset_x, -u_offset_y)).a;
    alpha += (1.0 - alpha) * texture2D(u_texture, v_texcoord + vec2(u_offset_x, 0.0)).a;
    alpha += (1.0 - alpha) * texture2D(u_texture, v_texcoord + vec2(u_offset_x, u_offset_y)).a;
    alpha = clamp(alpha, 0.0, 1.0);

    vec4 final_color;
    if (init_alpha > 0.0) {
        final_color = mix(outline, foreground, init_alpha);
    } else {
        final_color = outline;
    }
    
    gl_FragColor = vec4(final_color.rgb * alpha, alpha);
}