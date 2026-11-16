#pragma once

#include <jsi/jsi.h>
#include <string>

namespace kksiazek::jsi {

void jsLog(facebook::jsi::Runtime &runtime, const std::string message);

} // namespace kksiazek::jsi