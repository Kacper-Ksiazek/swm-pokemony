#include "workshop-log.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

void jsLog(jsi::Runtime &runtime, const std::string message) {
  auto console = runtime.global().getPropertyAsObject(runtime, "console");
  auto log = console.getPropertyAsFunction(runtime, "log");

  log.call(runtime, jsi::String::createFromUtf8(runtime, "[C++] " + message));
}

} // namespace kksiazek::jsi