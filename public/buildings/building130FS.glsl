precision highp float;
uniform vec4 u_diffuse;
uniform vec4 u_emission;
uniform float u_transparency;
void main(void) {
vec4 color = vec4(0., 0., 0., 0.);
vec4 diffuse = vec4(0., 0., 0., 1.);
vec4 emission;
diffuse = u_diffuse;
emission = u_emission;
color.xyz += diffuse.xyz;
color.xyz += emission.xyz;
color = vec4(color.rgb * diffuse.a, diffuse.a * u_transparency);
gl_FragColor = color;
}
