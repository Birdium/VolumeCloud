#version 460 core
out vec4 FragColor;

in vec2 TexCoords;
in vec3 WorldPos;
in vec3 ViewDir;

uniform sampler3D noiseTex1;
uniform sampler3D noiseTex2;

struct CloudParams {
    vec4 shapeParams;    // coverage, density, softness, altitude
    vec4 lightParams;    // absorption, scattering, powder, phase
    vec3 sunColor;
    vec3 windDirection;
    float timeScale;
    float minHeight;
    float maxHeight;
    float sphereRadius;
    vec3 sphereCenter;
};
uniform CloudParams cloudParams;

uniform vec3 cameraPos;
uniform mat4 invProjection;
uniform mat4 invView;

// 光线与球体相交
vec2 raySphereIntersection(vec3 origin, vec3 dir, vec3 center, float radius) {
    vec3 oc = origin - center;
    float a = dot(dir, dir);
    float b = 2.0 * dot(oc, dir);
    float c = dot(oc, oc) - radius * radius;
    float discriminant = b * b - 4.0 * a * c;
    
    if (discriminant < 0.0) {
        return vec2(-1.0);
    }
    
    float sqrtDisc = sqrt(discriminant);
    float t1 = (-b - sqrtDisc) / (2.0 * a);
    float t2 = (-b + sqrtDisc) / (2.0 * a);
    
    return vec2(t1, t2);
}

// 云密度采样
float sampleCloudDensity(vec3 position) {
    // 应用风动画
    vec3 animatedPos = position + cloudParams.windDirection * cloudParams.timeScale * float(gl_FragCoord.x);
    
    // 采样噪声纹理
    float noise1 = texture(noiseTex1, animatedPos * 0.01).r;
    float noise2 = texture(noiseTex2, animatedPos * 0.05).r;
    
    // 组合噪声
    float baseShape = clamp(noise1 - cloudParams.shapeParams.x, 0.0, 1.0) * cloudParams.shapeParams.y;
    float detail = noise2 * cloudParams.shapeParams.z;
    float finalDensity = baseShape * detail;
    
    // 高度衰减
    float height = position.y - cloudParams.minHeight;
    float heightFactor = clamp(height / (cloudParams.maxHeight - cloudParams.minHeight), 0.0, 1.0);
    heightFactor *= 1.0 - clamp((height - cloudParams.maxHeight * 0.8) / (cloudParams.maxHeight * 0.2), 0.0, 1.0);
    
    return finalDensity * heightFactor;
}

// 光照计算
vec3 calculateLighting(vec3 position, float density, vec3 sunDir) {
    // Henyey-Greenstein相位函数
    float g = cloudParams.lightParams.w;
    float cosTheta = dot(normalize(position - cameraPos), sunDir);
    float phase = (1.0 - g * g) / (4.0 * 3.1415 * pow(1.0 + g * g - 2.0 * g * cosTheta, 1.5));
    
    // 光线吸收
    float beer = exp(-density * cloudParams.lightParams.x);
    
    // 粉末效果
    float powder = 1.0 - exp(-density * 2.0 * cloudParams.lightParams.z);
    
    return cloudParams.sunColor * phase * beer * powder * cloudParams.lightParams.y;
}

void main() {
    vec3 rayOrigin = cameraPos;
    vec3 rayDir = normalize(ViewDir);
    
    // 最大渲染距离
    float maxDistance = 10000.0;
    
    // 初始化结果
    vec4 result = vec4(0.0);
    
    // 计算与云层的交点
    vec2 cloudHit = raySphereIntersection(rayOrigin, rayDir, cloudParams.sphereCenter, cloudParams.sphereRadius);
    if (cloudHit.x > cloudHit.y) {
        FragColor = result;
        return;
    }
    
    float startDistance = max(cloudHit.x, 0.0);
    float endDistance = min(cloudHit.y, maxDistance);
    
    // Ray Marching参数
    int stepCount = 64;
    float stepSize = (endDistance - startDistance) / float(stepCount);
    
    // 太阳方向 (简单起见，假设在xz平面)
    vec3 sunDir = normalize(vec3(1.0, 0.5, 1.0));
    
    float transmittance = 1.0;
    
    for (int i = 0; i < stepCount; ++i) {
        float t = startDistance + (float(i) + 0.5) * stepSize;
        vec3 samplePos = rayOrigin + rayDir * t;
        
        float density = sampleCloudDensity(samplePos);
        if (density <= 0.0) continue;
        
        // 光照计算
        vec3 lighting = calculateLighting(samplePos, density, sunDir);
        
        // 累积颜色和透明度
        float alpha = density * stepSize;
        vec3 color = lighting * transmittance;
        
        result.rgb += color * alpha;
        transmittance *= exp(-alpha);
        
        // 提前退出
        if (transmittance < 0.01) break;
    }
    
    result.a = 1.0 - transmittance;
    FragColor = result;
}