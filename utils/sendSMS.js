const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Function to send SMS OTP using Way2Mint
const sendSmsOtp = async (phone, otp) => {
  try {
    const response = await axios.get(process.env.WAY2MINT_BASE_URL, {
      params: {
        username: process.env.WAY2MINT_USERNAME,
        password: process.env.WAY2MINT_PASSWORD,
        tmplId: process.env.WAY2MINT_TEMPLATE_ID,
        to: `91${phone}`,
        from: process.env.WAY2MINT_SENDER_ID,
        text: `Your Mediversal OTP is ${otp}. Access approved-because good health shouldn't wait. Welcome aboard! Message ID: VzSiQcXRmi2`,
        data4: process.env.WAY2MINT_DATA4, // Optional parameter
      },
    });
    console.log("Way2Mint SMS Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending SMS via Way2Mint:", error.response?.data || error.message);
    throw new Error("Failed to send OTP via SMS");
  }
};

module.exports = sendSmsOtp;