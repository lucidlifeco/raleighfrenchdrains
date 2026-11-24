// Raleigh French Drains text replies (Twilio Function, path: /sms)
//
// When a homeowner texts the number (usually replying to the missed-call text),
// this sends you a push alert and forwards the text to your cell so you can call them right back.
// STOP, HELP and similar keywords are handled by Twilio automatically.
//
// Uses the same environment variables as /call: FORWARD_TO and NTFY_TOPIC.

exports.handler = async function (context, event, callback) {
  const from = event.From || "unknown";
  const body = (event.Body || "").trim();
  const note = `Text from ${from}: ${body || "(no text)"}. Call them back now.`;

  // Push alert
  if (context.NTFY_TOPIC) {
    try {
      await fetch(`https://ntfy.sh/${context.NTFY_TOPIC}`, {
        method: "POST",
        body: note,
        headers: { Title: "New text lead", Priority: "high" },
      });
    } catch (err) {
      console.error("Alert failed", err);
    }
  }

  // Forward to your cell, unless the text came from your own phone
  if (context.FORWARD_TO && from !== context.FORWARD_TO) {
    try {
      await context.getTwilioClient().messages.create({
        from: event.To,
        to: context.FORWARD_TO,
        body: `Lead text from ${from}: ${body}`.slice(0, 600),
      });
    } catch (err) {
      console.error("Forward failed", err);
    }
  }

  // No auto-reply here. You call them back.
  return callback(null, new Twilio.twiml.MessagingResponse());
};
