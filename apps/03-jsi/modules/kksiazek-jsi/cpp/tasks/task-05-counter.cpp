#include <jsi/jsi.h>
#include <memory>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

void task5(facebook::jsi::Runtime &runtime) {
  auto counter = std::make_shared<int>(0);

  const char *counterPropertyName = "counter";
  const char *incrementPropertyName = "increment";
  const char *decrementPropertyName = "decrement";

  auto syncCounter = [counter,
                      counterPropertyName](jsi::Runtime &runtime) -> void {
    runtime.global()
        .setProperty(runtime, counterPropertyName, jsi::Value(*counter));
  };

  auto increment = [counter, syncCounter](
                       jsi::Runtime &runtime,
                       const jsi::Value &thisValue,
                       const jsi::Value *args,
                       size_t count
                   ) -> jsi::Value {
    *counter += 1;
    syncCounter(runtime);

    return jsi::Value(*counter);
  };

  auto decrement = [counter, syncCounter](
                       jsi::Runtime &runtime,
                       const jsi::Value &thisValue,
                       const jsi::Value *args,
                       size_t count
                   ) -> jsi::Value {
    *counter -= 1;
    syncCounter(runtime);

    return jsi::Value(*counter);
  };

  syncCounter(runtime);

  runtime.global().setProperty(
      runtime,
      incrementPropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, incrementPropertyName),
          0,
          increment
      )
  );

  runtime.global().setProperty(
      runtime,
      decrementPropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, decrementPropertyName),
          0,
          decrement
      )
  );
}

} // namespace kksiazek::jsi