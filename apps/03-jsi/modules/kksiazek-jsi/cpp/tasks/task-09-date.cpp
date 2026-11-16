#include <ctime>
#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <vector>

#include "tasks/tasks.hpp"

namespace kksiazek::jsi {

using namespace facebook::jsi;

class DateHostObject : public jsi::HostObject {
public:
  DateHostObject() {
    std::time_t rawtime = std::time(nullptr);
    std::tm *timeinfo = std::localtime(&rawtime);
    if (timeinfo != nullptr) {
      year_ = timeinfo->tm_year + 1900;
      month_ = timeinfo->tm_mon + 1;
      day_ = timeinfo->tm_mday;
    }
  }

  jsi::Value get(jsi::Runtime &rt, const jsi::PropNameID &name) override {
    std::string prop = name.utf8(rt);

    if (prop == "now") {
      std::time_t now = std::time(nullptr);
      std::string dateTime = std::ctime(&now);
      if (!dateTime.empty() && dateTime.back() == '\n') {
        dateTime.pop_back();
      }
      return jsi::String::createFromUtf8(rt, dateTime);
    }

    if (prop == "day") {
      return jsi::Value(day_);
    }

    if (prop == "month") {
      return jsi::Value(month_);
    }

    if (prop == "year") {
      return jsi::Value(year_);
    }

    return jsi::Value::undefined();
  }

  void
  set(jsi::Runtime &rt,
      const jsi::PropNameID &name,
      const jsi::Value &value) override {
    std::string prop = name.utf8(rt);

    if (prop == "now") {
      throw jsi::JSError(rt, "Date.now is read-only");
    }

    if (prop == "day" || prop == "month" || prop == "year") {
      if (!value.isNumber()) {
        throw jsi::JSError(rt, "Date." + prop + " must be a number");
      }

      int nextValue = static_cast<int>(value.asNumber());
      if (prop == "day") {
        day_ = nextValue;
      } else if (prop == "month") {
        month_ = nextValue;
      } else {
        year_ = nextValue;
      }
      return;
    }

    throw jsi::JSError(rt, "Unknown property on Date HostObject: " + prop);
  }

  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime &rt) override {
    return jsi::PropNameID::names(rt, "now", "day", "month", "year");
  }

private:
  int day_ = 1;
  int month_ = 1;
  int year_ = 1970;
};

void task9(facebook::jsi::Runtime &runtime) {
  const char *getDateObjectPropertyName = "getDateObject";

  auto getDateObject = [](jsi::Runtime &runtime,
                          const jsi::Value &thisValue,
                          const jsi::Value *args,
                          size_t count) -> jsi::Value {
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<DateHostObject>()
    );
  };

  runtime.global().setProperty(
      runtime,
      getDateObjectPropertyName,
      jsi::Function::createFromHostFunction(
          runtime,
          jsi::PropNameID::forAscii(runtime, getDateObjectPropertyName),
          0,
          getDateObject
      )
  );
}

} // namespace kksiazek::jsi