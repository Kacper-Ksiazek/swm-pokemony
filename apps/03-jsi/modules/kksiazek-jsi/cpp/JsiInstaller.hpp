#pragma once

#include <jsi/jsi.h>

namespace kksiazek::jsi {

// Runs on the JS thread. iOS and Android both call this with the app runtime.
void main(facebook::jsi::Runtime &runtime);

void task1(facebook::jsi::Runtime &runtime);

void task2(facebook::jsi::Runtime &runtime);

void task3(facebook::jsi::Runtime &runtime);

void task4(facebook::jsi::Runtime &runtime);

void task5(facebook::jsi::Runtime &runtime);

void task6(facebook::jsi::Runtime &runtime);

void task7(facebook::jsi::Runtime &runtime);

} // namespace kksiazek::jsi
