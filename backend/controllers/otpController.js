const otpStore = new Map();

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;

const getMissingSmsKeys = () => {
  const missing = [];
  if (!twilioAccountSid) missing.push("TWILIO_ACCOUNT_SID");
  if (!twilioAuthToken) missing.push("TWILIO_AUTH_TOKEN");
  if (!twilioPhoneNumber) missing.push("TWILIO_PHONE_NUMBER");
  return missing;
};

let twilioClient = null;
if (
  twilioAccountSid &&
  twilioAuthToken &&
  twilioPhoneNumber
) {
  try {
    const twilio = require("twilio");
    twilioClient = twilio(twilioAccountSid, twilioAuthToken);
  } catch (error) {
    twilioClient = null;
  }
}

const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "");

const formatIndianE164 = (phoneDigits) => {
  if (phoneDigits.length === 10) {
    return `+91${phoneDigits}`;
  }
  if (phoneDigits.length === 12 && phoneDigits.startsWith("91")) {
    return `+${phoneDigits}`;
  }
  return null;
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const phoneDigits = normalizePhone(phone);

    if (phoneDigits.length !== 10) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }

    const e164Phone = formatIndianE164(phoneDigits);

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(phoneDigits, { otp, expiresAt });

    const missingKeys = getMissingSmsKeys();
    if (!twilioClient || !e164Phone || missingKeys.length > 0) {
      return res.json({
        message: "OTP generated. SMS service is not configured on server.",
        smsSent: false,
        missingKeys,
        devOtp: otp,
      });
    }

    await twilioClient.messages.create({
      body: `Your Food Recipes OTP is ${otp}. It expires in 5 minutes.`,
      from: twilioPhoneNumber,
      to: e164Phone,
    });

    return res.json({
      message: "OTP sent successfully",
      smsSent: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Failed to send OTP",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const phoneDigits = normalizePhone(phone);
    const otpValue = String(otp || "").trim();

    if (phoneDigits.length !== 10 || otpValue.length !== 6) {
      return res.status(400).json({ error: "Invalid phone number or OTP format" });
    }

    const stored = otpStore.get(phoneDigits);
    if (!stored) {
      return res.status(400).json({ error: "OTP not found. Please request a new OTP." });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phoneDigits);
      return res.status(400).json({ error: "OTP expired. Please request a new OTP." });
    }

    if (stored.otp !== otpValue) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    otpStore.delete(phoneDigits);
    return res.json({ message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
};

module.exports = { sendOtp, verifyOtp };
