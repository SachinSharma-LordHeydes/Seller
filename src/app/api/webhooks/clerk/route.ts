// app/api/webhooks/clerk/route.ts
import { prisma } from "@/lib/prisma";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const secret = process.env.SIGNING_SECRET;

  console.log("Secret--->", secret);

  if (!secret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const payload = await req.text();
  const headerList = await headers();

  // Get headers with null checks
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  // Validate required headers exist
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing required headers", { status: 400 });
  }

  const wh = new Webhook(secret);
  let event: WebhookEvent;

  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated":
      try {
        const { id, email_addresses } = event.data;
        const email = email_addresses[0]?.email_address;

        if (!email) {
          throw new Error("No email found in webhook payload");
        }

        await prisma.user.upsert({
          where: { clerkId: id },
          update: {
            email,
            role: {
              set: "SELLER",
            },
          },
          create: { clerkId: id, email,role: "SELLER", },
        });
      } catch (err) {
        console.error("Error processing user event:", err);
        return new Response("Error processing user data", { status: 500 });
      }
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response("OK", { status: 200 });
}
