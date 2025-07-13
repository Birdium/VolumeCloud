#version 330 core
out vec4 FragColor;
in vec2 TexCoord;
uniform float uTime;

float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    float v000 = hash(i + vec3(0, 0, 0));
    float v100 = hash(i + vec3(1, 0, 0));
    float v010 = hash(i + vec3(0, 1, 0));
    float v110 = hash(i + vec3(1, 1, 0));
    float v001 = hash(i + vec3(0, 0, 1));
    float v101 = hash(i + vec3(1, 0, 1));
    float v011 = hash(i + vec3(0, 1, 1));
    float v111 = hash(i + vec3(1, 1, 1));

    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(mix(v000, v100, u.x), mix(v010, v110, u.x), u.y),
               mix(mix(v001, v101, u.x), mix(v011, v111, u.x), u.y), u.z);
}

// FBM with higher frequency and finer details
float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.6;
    float frequency = 1.5;
    for (int i = 0; i < 6; ++i) {
        value += amplitude * valueNoise(p * frequency);
        frequency *= 2.1;
        amplitude *= 0.45;
    }
    return value;
}

void main() {
    vec3 rayOrigin = vec3(0.0, 0.0, 0.0);
    vec3 rayDir = normalize(vec3(TexCoord - 0.5, 1.0));

    // Sky background gradient
    vec3 skyTop = vec3(0.52, 0.75, 0.95);
    vec3 skyBottom = vec3(0.90, 0.95, 1.00);
    float skyT = clamp(rayDir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 background = mix(skyBottom, skyTop, pow(skyT, 1.5));

    vec3 color = background;
    float transmittance = 1.0;
    float t = 0.0;

    const int MAX_STEPS = 128;
    const float STEP_SIZE = 0.08;

    for (int i = 0; i < MAX_STEPS; ++i) {
        vec3 pos = rayOrigin + t * rayDir;

        // Animate both X and Z to simulate movement
        vec3 animatedPos = pos * 1.0 + vec3(uTime * 0.05, 0.0, uTime * 0.02);

        // Optional: constrain cloud to a "height layer"
        float heightFactor = smoothstep(-1.0, 2.0, pos.y) * smoothstep(6.0, 4.0, pos.y);

        float base = fbm(animatedPos * 0.5);
        float detail = fbm(animatedPos * 2.0);
        float d = base * detail;

        // Sharper density mapping, more broken-up clouds
        float density = smoothstep(0.3, 0.7, d);
        density = pow(density, 1.5);
        density *= heightFactor;

        // Filter out very low density
        if (density < 0.05) {
            t += STEP_SIZE;
            continue;
        }

        // Simple lighting
        vec3 light = vec3(1.0);
        vec3 cloudColor = vec3(1.0);

        color = mix(color, cloudColor * light, density * transmittance * 0.2);
        transmittance *= exp(-density * 0.15);
        if (transmittance < 0.01) break;

        t += STEP_SIZE;
    }

    FragColor = vec4(color, 1.0);
}
