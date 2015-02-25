precision highp float;
varying vec2 v_texcoord0;
uniform sampler2D u_diffuse;
void main(void) {
vec4 color = vec4(0., 0., 0., 0.);
vec4 diffuse = vec4(0., 0., 0., 1.);
diffuse = texture2D(u_diffuse, v_texcoord0);
color.xyz += diffuse.xyz;
color = vec4(color.rgb * diffuse.a, diffuse.a);
gl_FragColor = color;
}
