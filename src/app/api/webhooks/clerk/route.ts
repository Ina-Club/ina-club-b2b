import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { handleUserCreated } from '@/lib/services/webhook';
import { NextResponse } from 'next/server';

// TODO: This should be tested in production, for now we assume it works.
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env');
    return new Response('Server configuration error', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let event: WebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured -- invalid signature', { status: 400 });
  }

  const eventType = event.type;

  if (eventType === 'user.created') {
    await handleUserCreated(event.data);
  }

  return NextResponse.json({ success: true, message: 'Webhook received' }, { status: 200 });
}
