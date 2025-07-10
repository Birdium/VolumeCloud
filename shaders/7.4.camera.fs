#version 330 core
out vec4 FragColor;

in vec2 TexCoord;

in vec2 pos;

// texture samplers
uniform sampler2D texture1;
uniform sampler2D texture2;

uniform vec3 cameraPos;
uniform mat4 model;
uniform mat4 inverseView;
uniform mat4 inverseProjection;

void main()
{
	vec4 raydir = inverseProjection * vec4(pos, -1.0, 1.0);
	raydir.w = 0.0; // set w to 0 to get direction vector
	raydir = inverseView * raydir; // transform to view space
	vec3 raydir3 = vec3(raydir); // convert to vec3
	raydir3 = normalize(raydir3); // normalize the direction vector
	
	// linearly interpolate between both textures (80% container, 20% awesomeface)
	// FragColor = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
	// raydir3.z = abs(raydir3.z); // flip the z-axis to match the camera's view direction
	float B = dot(raydir3, cameraPos);
	float C = dot(cameraPos, cameraPos) - 1.0; // assuming the sphere is centered at the origin with radius 1
	float D = B * B - C; // discriminant
	if (D < 0.0) {
		// no intersection with the sphere
		FragColor = vec4(0.0, 0.0, 0.0, 1.0); // black color
		return;
	}
	
	FragColor = vec4(raydir3 * 0.5 + 0.5 , 1.0);
}