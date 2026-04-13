import { Webhook } from 'svix';
import dotenv from 'dotenv';
import path from 'path';

// Load your local environment variables from the root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const userId = "USER_ID_HERE";
const userEmail = "EMAIL_HERE";

if (!WEBHOOK_SECRET) {
  throw new Error("Missing WEBHOOK_SECRET. Make sure it's in your .env.local file");
}

// 1. Mock the specific data Clerk would send
// Make sure to replace "the_invited_email@example.com" with a real email
// that you just created a B2BInvitation for in your database.
const payload = {
  data: {
    id: userId,
    email_addresses: [
      {
        email_address: userEmail
      }
    ]
  },
  type: "user.created"
};

const payloadString = JSON.stringify(payload);

// 2. Sign the payload exactly like Clerk does
const wh = new Webhook(WEBHOOK_SECRET);
const msgId = 'msg_test_' + Date.now();
const timestamp = new Date();
const signature = wh.sign(msgId, timestamp, payloadString);

console.log("Mocking payload and sending to local server...");

// 3. Send the HTTP request locally
fetch('http://localhost:3000/api/webhooks/clerk', {
  method: 'POST',
  headers: {
    'svix-id': msgId,
    'svix-timestamp': Math.floor(timestamp.getTime() / 1000).toString(),
    'svix-signature': signature,
    'Content-Type': 'application/json'
  },
  body: payloadString
})
  .then(async (res) => {
    console.log(`Status: ${res.status}`);
    console.log(await res.json());
  })
  .catch(console.error);
