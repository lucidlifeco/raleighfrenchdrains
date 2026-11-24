// Raleigh French Drains call flow (Twilio Function, path: /call)
//
// What it does:
//   1. Tells the caller the call may be recorded.
//   2. Rings FORWARD_TO for up to 30 seconds and records the call.
//   3. When you answer, you hear "Raleigh drains lead. Press 1 to take the call."
//      If nobody presses 1 (for example, your voicemail picks up), the call is dropped.
//   4. If the call isn't connected: the caller gets an instant text (when TEXT_BACK is "on"),
//      you get a push alert, and the caller can leave a voicemail.
//
// Environment variables (Service > Settings > Environment Variables):
//   FORWARD_TO  = the phone to ring, like +19105551234. Change this to a renter's number later.
//   NTFY_TOPIC  = the ntfy topic for missed-call alerts. Leave empty to turn alerts off.
//   TEXT_BACK   = "on" to text missed callers. Turn on only after A2P 10DLC registration
//                 is approved for this number, or carriers will block the texts.

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
    const gather = twiml.gather({ numDigits: 1, timeout: 6, action: "/call?step=accept" });
    gather.say("Raleigh drains lead. Press 1 to take the call.");
    twiml.hangup();
  } else if (step === "accept") {
    // An empty response connects the call. Anything other than 1 drops it.
    if (event.Digits !== "1") twiml.hangup();
  } else if (step === "after") {
    if (event.DialBridged === "true") {
      twiml.hangup();
    } else {
      const texted = await textBack(context, event);
      await alert(context, `Missed call from ${event.From}. Call them back now.${texted ? " (Texted them.)" : ""}`);
      twiml.say(
        (texted
          ? "Sorry, the pro is helping another customer. We just sent you a text, so you can reply there. Or "
          : "Sorry, the pro is helping another customer. ") +
          "leave your name, your address, and what's happening with your yard after the tone."
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

// Instant text to a missed caller. Needs an approved A2P 10DLC campaign on this number.
async function textBack(context, event) {
  if (context.TEXT_BACK !== "on") return false;
  const to = event.From || "";
  if (!/^\+1\d{10}$/.test(to)) return false; // skip blocked or non-US numbers
  try {
    await context.getTwilioClient().messages.create({
      from: event.To,
      to,
      body: "Raleigh French Drains: Sorry we missed you. What's going on with your yard? Reply STOP to opt out.",
    });
    return true;
  } catch (err) {
    console.error("Text-back failed", err);
    return false;
  }
}

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
