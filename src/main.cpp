#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <iostream>
#include "Shader.h"

float quadVertices[] = {
    // positions   // texCoords
    -1.0f, -1.0f,  0.0f, 0.0f,
     1.0f, -1.0f,  1.0f, 0.0f,
    -1.0f,  1.0f,  0.0f, 1.0f,
     1.0f,  1.0f,  1.0f, 1.0f,
};

int main() {
    glfwInit();
    GLFWwindow* window = glfwCreateWindow(1920, 1080, "Volumetric Clouds", nullptr, nullptr);
    glfwMakeContextCurrent(window);
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cerr << "Failed to initialize GLAD" << std::endl;
        return -1;
    }

    GLuint VAO, VBO;
    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);
    glBindVertexArray(VAO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(quadVertices), quadVertices, GL_STATIC_DRAW);

    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)(2 * sizeof(float)));
    glEnableVertexAttribArray(1);

    Shader shader("shaders/cloud.vert", "shaders/cloud.frag");

    GLuint timeQuery;
    glGenQueries(1, &timeQuery);

    while (!glfwWindowShouldClose(window)) {
        float time = glfwGetTime();
        glClear(GL_COLOR_BUFFER_BIT);

        glBeginQuery(GL_TIME_ELAPSED, timeQuery);

        shader.use();
        shader.setFloat("uTime", time);

        glEndQuery(GL_TIME_ELAPSED);

        GLint available = 0;
        while (!available) {
            glGetQueryObjectiv(timeQuery, GL_QUERY_RESULT_AVAILABLE, &available);
        }

        GLuint64 timeElapsed;
        glGetQueryObjectui64v(timeQuery, GL_QUERY_RESULT, &timeElapsed);

        std::cout << "Frame GPU time: " << (timeElapsed / 1000000.0) << " ms" << std::endl;


        glBindVertexArray(VAO);
        glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;
}
