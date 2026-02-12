cmake_minimum_required(VERSION 3.10)
project(campus_maintenance_cpp)

set(CMAKE_CXX_STANDARD 17)

add_library(assignment_algorithm
    src/assignment_algorithm.cpp
    src/image_compressor.cpp
)

target_include_directories(assignment_algorithm PUBLIC include)

# For JNI bindings
find_package(JNI REQUIRED)
target_include_directories(assignment_algorithm PUBLIC ${JNI_INCLUDE_DIRS})