#include <jsi/jsi.h>
#include <memory>
#include <vector>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

class InfinityObject : public jsi::HostObject {
public:
  jsi::Value get(jsi::Runtime &rt, const jsi::PropNameID &name) override {
    counter_++;
    return jsi::Value(counter_);
  }

  void set(
      jsi::Runtime &rt,
      const jsi::PropNameID &name,
      const jsi::Value &value
  ) override {
    counter_--;
  }

  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime &rt) override {
    return {};
  }

  int peek() const {
    return counter_;
  }

private:
  int counter_ = 0;
};

void task10(facebook::jsi::Runtime &runtime) {
  const char *getInfinityObjectPropertyName = "getInfinityObject";
  const char *peekInfinityCounterPropertyName = "peekInfinityCounter";

  auto getInfinityObject = [](jsi::Runtime &runtime,
                              const jsi::Value &thisValue,
                              const jsi::Value *args,
                              size_t count) -> jsi::Value {
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<InfinityObject>()
    );
  };

  auto peekInfinityCounter = [](jsi::Runtime &runtime,
                                const jsi::Value &thisValue,
                                const jsi::Value *args,
                                size_t count) -> jsi::Value {
    if (count < 1 || !args[0].isObject() ||
        !args[0].asObject(runtime).isHostObject<InfinityObject>(runtime)) {
      throw jsi::JSError(
          runtime,
          "peekInfinityCounter() requires an InfinityObject instance"
      );
    }

    auto hostObj =
        args[0].asObject(runtime).getHostObject<InfinityObject>(runtime);
    return jsi::Value(hostObj->peek());
  };

  runtime.global().setProperty(
      runtime,
      getInfinityObjectPropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, getInfinityObjectPropertyName),
          0,
          getInfinityObject
      )
  );

  runtime.global().setProperty(
      runtime,
      peekInfinityCounterPropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, peekInfinityCounterPropertyName),
          1,
          peekInfinityCounter
      )
  );
}

} // namespace kksiazek::jsi
