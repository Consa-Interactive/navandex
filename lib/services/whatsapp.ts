import { Order, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const WHATSAPP_API_URL =
  "https://graph.facebook.com/v21.0/557766617420257/messages";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

type OrderWithUser = Order & {
  user: {
    name: string;
    phoneNumber: string;
  };
};

type MessageTemplate = {
  status: string;
  templateName: string;
  getComponents: (order: OrderWithUser) => {
    components: {
      type: string;
      parameters: {
        type: string;
        text: string;
      }[];
    }[];
  };
};

const messageTemplates: MessageTemplate[] = [
  {
    status: "PROCESSING",
    templateName: "order_processing",
    getComponents: (order: OrderWithUser) => ({
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: order.user.name },
            { type: "text", text: `TR${order.id.toString().padStart(5, "0")}` },
            { type: "text", text: order.title || "your order" },
            { type: "text", text: `$${order.price.toFixed(2)}` },
            {
              type: "text",
              text: new Date().toLocaleDateString("en", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            },
          ],
        },
      ],
    }),
  },
  {
    status: "CANCELLED",
    templateName: "order_cancellation_notice",
    getComponents: (order: OrderWithUser) => ({
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: order.user.name },
            { type: "text", text: `TR${order.id.toString().padStart(5, "0")}` },
            { type: "text", text: order.title || "your order" },
            {
              type: "text",
              text: new Date().toLocaleDateString("en", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ],
        },
      ],
    }),
  },
  {
    status: "DELIVERED_TO_WAREHOUSE",
    templateName: "warehouse_delivery_confirmation",
    getComponents: (order: OrderWithUser) => ({
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: order.user.name },
            { type: "text", text: `TR${order.id.toString().padStart(5, "0")}` },
            { type: "text", text: order.title || "your order" },
            {
              type: "text",
              text: new Date().toLocaleDateString("en", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            },
            { type: "text", text: "Erbil" },
          ],
        },
      ],
    }),
  },
];

// Queue system
type QueueItem = {
  orderId: number;
  retries: number;
};

class MessageQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private readonly MAX_RETRIES = 3;
  private readonly DELAY_BETWEEN_MESSAGES = 5000; // 5 seconds

  async add(orderId: number) {
    this.queue.push({ orderId, retries: 0 });
    if (!this.processing) {
      this.process();
    }
  }

  private async process() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const item = this.queue[0];

    try {
      await sendWhatsAppMessageInternal(item.orderId);
      this.queue.shift(); // Remove successfully processed item
    } catch (error) {
      console.error(
        `Failed to send WhatsApp message for order ${item.orderId}:`,
        error
      );

      if (item.retries < this.MAX_RETRIES) {
        // Move to end of queue for retry
        this.queue.shift();
        this.queue.push({ orderId: item.orderId, retries: item.retries + 1 });
      } else {
        // Remove after max retries
        this.queue.shift();
        console.error(
          `Failed to send WhatsApp message for order ${item.orderId} after ${this.MAX_RETRIES} attempts`
        );
      }
    }

    // Wait before processing next message
    await new Promise((resolve) =>
      setTimeout(resolve, this.DELAY_BETWEEN_MESSAGES)
    );
    this.process();
  }
}

// Create singleton instance of message queue
const messageQueue = new MessageQueue();
export { messageQueue }; // Export for use in other files

// Original message sending function becomes internal
async function sendWhatsAppMessageInternal(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          name: true,
          phoneNumber: true,
        },
      },
    },
  });

  if (!order || !order.user) return;

  const template = messageTemplates.find((t) => t.status === order.status);
  if (!template) return;

  // TODO: add phone number validation
  // const phoneNumber = order.user.phoneNumber.replace(/\D/g, "");

  const response = await fetch(WHATSAPP_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: "9647503602328",
      type: "template",
      template: {
        name: template.templateName,
        language: {
          code: "en",
        },
        ...template.getComponents(order as OrderWithUser),
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to send WhatsApp message: ${JSON.stringify(error)}`
    );
  }

  return response.json();
}

// Public function now adds to queue instead of sending directly
export async function sendWhatsAppMessage(orderId: number) {
  // TODO: REMOVE THIS LATER
  console.log(orderId);
  // await messageQueue.add(orderId);
}
