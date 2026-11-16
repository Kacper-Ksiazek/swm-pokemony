#include "JsiInstaller.hpp"

#include "tasks/tasks.hpp"
#include "workshop-log.hpp"

namespace kksiazek::jsi {

void main(facebook::jsi::Runtime &runtime) {
  jsLog(runtime, "Starting JSI workshop");

  task1(runtime);
  task2(runtime);
  task3(runtime);
  task4(runtime);
  task5(runtime);
  task6(runtime);
  task7(runtime);
  task8(runtime);
  task9(runtime);
  task10(runtime);
  task11(runtime);
  task12(runtime);
  task13(runtime);

  const char *readinessGatePropertyName = "__kksiazekJsiReady";
  runtime.global().setProperty(runtime, readinessGatePropertyName, true);
}

} // namespace kksiazek::jsi