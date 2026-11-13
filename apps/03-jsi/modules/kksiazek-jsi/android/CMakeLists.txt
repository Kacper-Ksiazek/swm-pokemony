cmake_minimum_required(VERSION 3.16)
project(kksiazekjsi)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(fbjni REQUIRED CONFIG)
find_package(ReactAndroid REQUIRED CONFIG)

if(EXISTS "${REACT_NATIVE_DIR}/ReactAndroid/cmake-utils/folly-flags.cmake")
  include("${REACT_NATIVE_DIR}/ReactAndroid/cmake-utils/folly-flags.cmake")
  add_compile_options(${folly_FLAGS})
endif()

add_library(
  kksiazekjsi
  SHARED
  src/main/cpp/JsiBindingsInstaller.cpp
  ../cpp/JsiInstaller.cpp)

target_include_directories(kksiazekjsi PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}/../cpp"
                                               "${REACT_NATIVE_DIR}/ReactAndroid/src/main/jni/react/turbomodule")

if(EXISTS "${REACT_NATIVE_DIR}/ReactCommon/cmake-utils/react-native-flags.cmake")
  include("${REACT_NATIVE_DIR}/ReactCommon/cmake-utils/react-native-flags.cmake")
  target_compile_reactnative_options(kksiazekjsi PUBLIC)
endif()

target_link_libraries(kksiazekjsi ReactAndroid::jsi ReactAndroid::reactnative fbjni::fbjni log)
