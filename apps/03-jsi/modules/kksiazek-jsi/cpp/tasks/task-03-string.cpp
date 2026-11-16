#include <jsi/jsi.h>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

// Inject string into JS global.
void task3(facebook::jsi::Runtime &runtime) {
  const char *propertyName = "workshopName";

  jsi::Value value =
      facebook::jsi::String::createFromUtf8(runtime, "JSI workshop");

  runtime.global().setProperty(runtime, propertyName, value);
}

} // namespace kksiazek::jsi