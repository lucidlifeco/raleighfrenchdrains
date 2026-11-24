// Raleigh French Drains call flow (Twilio Function, path: /call)
//
// What it does:
//   1. Tells the caller the call may be recorded.
//   2. Rings FORWARD_TO for up to 30 seconds and records the call.
//   3. When you answer, you hear "Raleigh drains lead. Press 1 to take the call." twice,
//      then you have 15 seconds to press 1.
//      If nobody presses 1 (for example, your voicemail picks up), the call is dropped.
//   4. If the call isn't connected, you get a push alert and the caller can leave a voicemail.
//      Call them back fast: texting leads isn't allowed for a referral service (carrier lead-gen rules).
//
// Environment variables (Service > Settings > Environment Variables):
//   FORWARD_TO  = the phone to ring, like +19105551234. Change this to a renter's number later.
//   NTFY_TOPIC  = the ntfy topic for missed-call alerts. Leave empty to turn alerts off.

exports.handler = async function (context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const step = event.step || "start";

  if (step === "start") {
    twiml.say("This call may be recorded.");
    const dial = twiml.dial({
      timeout: 30,
      action: "/call?step=after",
      record: "record-from-answer-dual",
    });
    dial.number({ url: "/call?step=whisper" }, context.FORWARD_TO);
  } else if (step === "whisper") {
    // Prompt plays twice, then waits 15 seconds for a key press (about 25 seconds total).
    const gather = twiml.gather({ numDigits: 1, timeout: 15, action: "/call?step=accept" });
    gather.say("Raleigh drains lead. Press 1 to take the call.");
    gather.pause({ length: 2 });
    gather.say("Press 1 to take the call.");
    twiml.hangup();
  } else if (step === "accept") {
    // An empty response connects the call. Anything other than 1 drops it.
    if (event.Digits !== "1") twiml.hangup();
  } else if (step === "after") {
    if (event.DialBridged === "true") {
      twiml.hangup();
    } else {
      await alert(context, `Missed call from ${event.From}. Call them back now.`);
      twiml.say(
        "Sorry we missed you. After the tone, leave your name, your address, " +
          "and what's happening with your yard, and we'll call you right back."
      );
      twiml.record({ maxLength: 120, playBeep: true, action: "/call?step=done" });
    }
  } else if (step === "done") {
    if (Number(event.RecordingDuration || 0) > 2) {
      await alert(context, `Voicemail from ${event.From} (${event.RecordingDuration}s). Listen in Twilio.`);
    }
    twiml.say("Thank you. Goodbye.");
    twiml.hangup();
  }

  return callback(null, twiml);
};

async function alert(context, message) {
  if (!context.NTFY_TOPIC) return;
  try {
    await fetch("https://ntfy.sh/" + context.NTFY_TOPIC, {
      method: "POST",
      body: message,
      headers: { Title: "Raleigh drains lead", Priority: "high" },
    });
  } catch (err) {
    console.error("Alert failed", err);
  }
}
