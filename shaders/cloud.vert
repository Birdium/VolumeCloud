#version 460 core
layout (location = 0) in vec2 aPos;
layout (location = 1) in vec2 aTexCoords;

out vec2 TexCoords;
out vec3 WorldPos;
out vec3 ViewDir;

uniform mat4 invProjection;
uniform mat4 invView;
uniform vec3 cameraPos;

void main() {
    TexCoords = aTexCoords;
    gl_Position = vec4(aPos, 0.0, 1.0);
    
    // 计算世界空间位置和视线方向
    vec4 clipPos = vec4(aPos, 1.0, 1.0);
    vec4 viewPos = invProjection * clipPos;
    viewPos /= viewPos.w;
    WorldPos = (invView * viewPos).xyz;
    ViewDir = normalize(WorldPos - cameraPos);
}