#pragma once
#include <glm/glm.hpp>
#include <string>
#include <vector>

class Texture3D {
public:
    unsigned int ID;
    int width, height, depth;

    Texture3D() : ID(0), width(0), height(0), depth(0) {}
    
    void loadFromFile(const std::string& filename) {
        // 这里应该是加载3D纹理文件的实现
        // 实际项目中需要根据文件格式实现
        
        // 示例: 创建一个简单的3D噪声纹理
        width = height = depth = 128;
        std::vector<unsigned char> data(width * height * depth);
        
        for (int z = 0; z < depth; ++z) {
            for (int y = 0; y < height; ++y) {
                for (int x = 0; x < width; ++x) {
                    float fx = x / float(width);
                    float fy = y / float(height);
                    float fz = z / float(depth);
                    
                    // 简单噪声生成
                    float value = 0.5f * (1.0f + sin(fx * 10.0f) * cos(fy * 10.0f) * sin(fz * 10.0f));
                    data[x + y * width + z * width * height] = static_cast<unsigned char>(value * 255);
                }
            }
        }
        
        glGenTextures(1, &ID);
        glBindTexture(GL_TEXTURE_3D, ID);
        
        glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_WRAP_S, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_WRAP_T, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_WRAP_R, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        
        glTexImage3D(GL_TEXTURE_3D, 0, GL_RED, width, height, depth, 0, GL_RED, GL_UNSIGNED_BYTE, data.data());
        glGenerateMipmap(GL_TEXTURE_3D);
    }
    
    ~Texture3D() {
        if (ID != 0) {
            glDeleteTextures(1, &ID);
        }
    }
};