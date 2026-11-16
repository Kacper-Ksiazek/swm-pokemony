#pragma once

#include <jsi/jsi.h>

namespace kksiazek::jsi {

// Runs on the JS thread. iOS and Android both call this with the app runtime.
void main(facebook::jsi::Runtime &runtime);

} // namespace kksiazek::jsi