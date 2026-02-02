#include <WiFiS3.h>
#include <WiFiSSLClient.h>
#include <ArduinoHttpClient.h>
#include <Servo.h>

// ================= WIFI =================
#define WIFI_SSID     "Lleva"
#define WIFI_PASSWORD "4koSiFyke123*"

// ================= FIREBASE =================
#define FIREBASE_HOST "gsafe-eeead-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_PORT 443

// ================= PINS =================
#define GAS_SENSOR A0
#define SERVO_PIN  9
#define BUZZER_PIN 8

// ================= CONFIG =================
#define GAS_THRESHOLD 300
#define SERVO_CLOSED 0
#define SERVO_OPEN   90

// ================= OBJECTS =================
Servo myservo;
WiFiSSLClient sslClient;
HttpClient https(sslClient, FIREBASE_HOST, FIREBASE_PORT);

// ================= STATE =================
enum Mode { AUTO, MANUAL };
Mode mode = AUTO;

bool manualIsOn = false;
bool buzzerState = false;
int  lastServoAngle = -1;

Mode lastMode = AUTO;
bool lastManualState = false;

// ================= TIMING =================
unsigned long lastGasLogTime = 0;
unsigned long lastFirebaseTime = 0;

const unsigned long GAS_LOG_INTERVAL = 1500;
const unsigned long FIREBASE_READ_INTERVAL = 5000;

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  myservo.attach(SERVO_PIN);
  myservo.write(SERVO_CLOSED);

  connectWiFi();
}

// ================= LOOP =================
void loop() {
  unsigned long now = millis();

  // 🔥 LOCAL SENSOR (decision source in AUTO)
  int localGasLevel = analogRead(GAS_SENSOR);

  if (now - lastGasLogTime >= GAS_LOG_INTERVAL) {
    logWithTime("Local gas level: " + String(localGasLevel));
    lastGasLogTime = now;
  }

  if (now - lastFirebaseTime >= FIREBASE_READ_INTERVAL) {
    readFirebaseConfig();
    lastFirebaseTime = now;
  }

  handleMode(localGasLevel);
  sendGasLevel(localGasLevel);
}

// ================= WIFI =================
void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi connected");
}

// ================= MODE LOGIC =================
void handleMode(int localGasLevel) {

  if (mode == AUTO) {

    if (mode != lastMode) {
      logWithTime("MODE: AUTO (LOCAL SENSOR)");
      lastMode = mode;
    }

    bool gasSafe = localGasLevel < GAS_THRESHOLD;

    // 🔥 SERVO: LOCAL SENSOR
    setServo(gasSafe, localGasLevel);

    // 🔥 BUZZER: LOCAL SENSOR
    setBuzzer(!gasSafe, localGasLevel);

  } else { // MANUAL MODE

    if (mode != lastMode) {
      logWithTime("MODE: MANUAL");
      lastMode = mode;
    }

    if (manualIsOn != lastManualState) {
      setServo(manualIsOn, -1);
      lastManualState = manualIsOn;
    }

    // 🔒 Manual mode: buzzer always OFF
    setBuzzer(false, localGasLevel);
  }
}

// ================= SERVO =================
void setServo(bool open, int gasLevel) {
  int angle = open ? SERVO_OPEN : SERVO_CLOSED;

  if (angle != lastServoAngle) {
    myservo.write(angle);
    lastServoAngle = angle;

    if (gasLevel >= 0) {
      logWithTime(
        String("Servo ") +
        (open ? "OPEN" : "CLOSED") +
        " | LOCAL GAS: " +
        String(gasLevel)
      );
    } else {
      logWithTime(String("Servo ") + (open ? "OPEN" : "CLOSED"));
    }
  }
}

// ================= BUZZER =================
void setBuzzer(bool on, int gasLevel) {
  if (on == buzzerState) return;

  digitalWrite(BUZZER_PIN, on ? HIGH : LOW);
  buzzerState = on;

  if (on) {
    logWithTime("🚨 BUZZER ON | LOCAL GAS: " + String(gasLevel));
  } else {
    logWithTime("✅ BUZZER OFF | LOCAL GAS: " + String(gasLevel));
  }
}

// ================= FIREBASE =================
void readFirebaseConfig() {

  https.beginRequest();
  https.get("/config/mode/mode.json");
  https.endRequest();

  if (https.responseStatusCode() == 200) {
    String body = https.responseBody();
    body.replace("\"", "");
    body.trim();
    mode = (body == "manual") ? MANUAL : AUTO;
    logWithTime("Firebase mode: " + body);
  }

  https.beginRequest();
  https.get("/regulator/state/isOn.json");
  https.endRequest();

  if (https.responseStatusCode() == 200) {
    String body = https.responseBody();
    body.replace("\"", "");
    body.trim();
    manualIsOn = (body == "true");
    logWithTime(String("Manual state: ") + (manualIsOn ? "ON" : "OFF"));
  }
}

// ================= SEND GAS =================
void sendGasLevel(int gasLevel) {
  static char payload[128];

  snprintf(payload, sizeof(payload),
           "{\"level\":%d,\"updatedAt\":\"2026-02-02T00:00:00Z\"}",
           gasLevel);

  https.beginRequest();
  https.put("/sensors/gasLevel.json", "application/json", payload);
  https.endRequest();
  https.responseStatusCode();
}

// ================= LOGGING =================
void logWithTime(String message) {
  unsigned long seconds = millis() / 1000;
  unsigned long minutes = seconds / 60;
  unsigned long hours   = minutes / 60;

  char buf[96];
  snprintf(buf, sizeof(buf),
           "[%02lu:%02lu:%02lu] %s",
           hours % 24, minutes % 60, seconds % 60,
           message.c_str());

  Serial.println(buf);
}
