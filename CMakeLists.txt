cmake_minimum_required(VERSION 3.15)
project(VolumeCloud)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 查找必要的包
find_package(OpenGL REQUIRED)
find_package(glfw3 REQUIRED)
find_package(GLEW REQUIRED)

# 包含目录
include_directories(
    include
)

# 源文件
set(SOURCES
    src/main.cpp
)

# 可执行文件
add_executable(VolumeCloud ${SOURCES})

add_subdirectory(glad)

# 链接库
target_link_libraries(VolumeCloud glfw glad
)

# 安装着色器和纹理资源
install(DIRECTORY shaders/ DESTINATION shaders)
install(DIRECTORY textures/ DESTINATION textures)

# 复制资源到构建目录（开发时使用）
add_custom_command(TARGET VolumeCloud POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/shaders
    ${CMAKE_BINARY_DIR}/shaders
)

add_custom_command(TARGET VolumeCloud POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/textures
    ${CMAKE_BINARY_DIR}/textures
)