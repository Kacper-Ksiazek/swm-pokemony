#include <jsi/jsi.h>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

// Inject int 42 onto the JS global.
void task1(facebook::jsi::Runtime &runtime) {
  runtime.global().setProperty(
      runtime,
      "answerToTheUltimateQuestionOfLifeTheUniverseAndEverything",
      jsi::Value(42)
  );
}

} // namespace kksiazek::jsi