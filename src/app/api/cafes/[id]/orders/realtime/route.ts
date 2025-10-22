import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RealtimeOrderUpdate } from "@/types";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id: cafeId } = await params;

    // Verify user has access to this cafe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { cafe: true, managedCafe: true },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const hasAccess = user.cafeId === cafeId || user.managedCafe?.id === cafeId;

    if (!hasAccess) {
      return new Response("Access denied", { status: 403 });
    }

    // Create Server-Sent Events stream
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const initialMessage = `data: ${JSON.stringify({
          type: "connection",
          status: "connected",
          cafeId,
          timestamp: new Date().toISOString(),
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialMessage));

        // Set up MongoDB Change Streams
        const setupChangeStream = async () => {
          try {
            // Get MongoDB client from Prisma
            const mongoClient = prisma.$runCommandRaw;

            // Create change stream pipeline with cafe filter
            const pipeline = [
              {
                $match: {
                  "fullDocument.cafeId": cafeId,
                  operationType: {
                    $in: ["insert", "update", "delete", "replace"],
                  },
                },
              },
            ];

            // Note: Prisma doesn't directly support change streams
            // We'll use a polling approach with short intervals for now
            // In production, you might want to use the native MongoDB driver

            let lastCheck = new Date();
            let isPolling = false; // Prevent concurrent polling

            const pollForChanges = async () => {
              if (isPolling) return; // Skip if already polling
              isPolling = true;
              try {
                // Get recent orders (last 5 seconds)
                const recentOrders = await prisma.order.findMany({
                  where: {
                    cafeId,
                    updatedAt: {
                      gte: lastCheck,
                    },
                  },
                  include: {
                    cafe: true,
                    table: true,
                    staff: true,
                    orderItems: {
                      include: {
                        menuItem: true,
                        orderItemExtras: {
                          include: {
                            extra: true,
                          },
                        },
                      },
                    },
                  },
                  orderBy: {
                    updatedAt: "desc",
                  },
                });

                // Send updates for each changed order
                for (const order of recentOrders) {
                  // Try to detect what type of change occurred
                  let operationType:
                    | "insert"
                    | "update"
                    | "delete"
                    | "replace" = "update";

                  // Simple heuristic: if order was created very recently (within last 5 seconds), it's likely an insert
                  const timeDiff = Date.now() - order.createdAt.getTime();
                  if (timeDiff < 5000) {
                    operationType = "insert";
                  }

                  const update: RealtimeOrderUpdate = {
                    operationType,
                    fullDocument:
                      order as unknown as RealtimeOrderUpdate["fullDocument"],
                    documentKey: { _id: order.id },
                    updateDescription: {
                      updatedFields: {
                        // We can't easily detect what changed without storing previous state
                        // For now, we'll mark common fields that might have changed
                        updatedAt: order.updatedAt,
                        products: order.products,
                        isPaid: order.isPaid,
                        totalAmount: order.totalAmount,
                      },
                      removedFields: [],
                    },
                    clusterTime: new Date().toISOString(),
                    ns: {
                      db: "cafe-management",
                      coll: "orders",
                    },
                  };

                  const message = `data: ${JSON.stringify({
                    type: "orderUpdate",
                    data: update,
                    timestamp: new Date().toISOString(),
                  })}\n\n`;

                  controller.enqueue(new TextEncoder().encode(message));
                }

                lastCheck = new Date();
              } catch (error) {
                console.error("Error polling for changes:", error);

                const errorMessage = `data: ${JSON.stringify({
                  type: "error",
                  error: "Failed to poll for changes",
                  timestamp: new Date().toISOString(),
                })}\n\n`;

                controller.enqueue(new TextEncoder().encode(errorMessage));
              } finally {
                isPolling = false; // Reset polling flag
              }
            };

            // Start polling every 3 seconds to reduce DB load
            const intervalId = setInterval(pollForChanges, 3000);

            // Cleanup function
            const cleanup = () => {
              clearInterval(intervalId);
              controller.close();
            };

            // Handle client disconnect
            request.signal.addEventListener("abort", cleanup);

            // Send heartbeat every 30 seconds
            const heartbeatInterval = setInterval(() => {
              const heartbeat = `data: ${JSON.stringify({
                type: "heartbeat",
                timestamp: new Date().toISOString(),
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(heartbeat));
            }, 30000);

            // Cleanup heartbeat on disconnect
            request.signal.addEventListener("abort", () => {
              clearInterval(heartbeatInterval);
            });
          } catch (error) {
            console.error("Error setting up change stream:", error);

            const errorMessage = `data: ${JSON.stringify({
              type: "error",
              error: "Failed to setup change stream",
              timestamp: new Date().toISOString(),
            })}\n\n`;

            controller.enqueue(new TextEncoder().encode(errorMessage));
          }
        };

        setupChangeStream();
      },
      cancel() {
        // Cleanup when client disconnects
        console.log("Client disconnected from realtime stream");
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    console.error("Realtime stream error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
