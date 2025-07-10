#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoord;

out vec2 TexCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec3 cameraPos;

vec2 ndPos[3] = vec2[](
	vec2(-1.0f, -1.0f),
	vec2( 3.0f, -1.0f),
	vec2(-1.0f,  3.0f)
);

out vec2 pos;

void main()
{
	// gl_Position = projection * view * model * vec4(aPos, 1.0f);
	pos = ndPos[gl_VertexID];
	float depth = 0.0f;
	gl_Position = vec4(pos, depth, 1.0);
	// TexCoord = vec2(aTexCoord.x, aTexCoord.y);
}