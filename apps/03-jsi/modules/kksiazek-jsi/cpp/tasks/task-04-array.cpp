#include <jsi/jsi.h>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

// Inject array into JS global context
void task4(facebook::jsi::Runtime &runtime) {
  const char *propertyName = "myAwesomeArray";

  jsi::Array arrayValue(runtime, 3);

  arrayValue.setValueAtIndex(runtime, 0, 42);
  arrayValue.setValueAtIndex(runtime, 1, true);
  arrayValue.setValueAtIndex(
      runtime,
      2,
      jsi::String::createFromUtf8(runtime, "JSI workshop")
  );

  runtime.global().setProperty(runtime, propertyName, arrayValue);
}

} // namespace kksiazek::jsi