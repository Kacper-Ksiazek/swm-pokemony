#include <jsi/jsi.h>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

// Inject `false` onto the JS global.
void task2(facebook::jsi::Runtime &runtime) {
  const char *propertyName = "isWednesday";

  jsi::Value value = jsi::Value(false);

  runtime.global().setProperty(runtime, propertyName, value);
}

} // namespace kksiazek::jsi