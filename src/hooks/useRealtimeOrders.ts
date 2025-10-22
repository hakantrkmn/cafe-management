"use client";

import {
  QueryKeys,
  RealtimeConnectionStatus,
  RealtimeOrderUpdate,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseRealtimeOrdersProps {
  cafeId: string | null;
  isEnabled: boolean;
}

interface UseRealtimeOrdersReturn {
  connectionStatus: RealtimeConnectionStatus;
  toggleRealtime: () => void;
  isRealtimeEnabled: boolean;
}

export function useRealtimeOrders({
  cafeId,
  isEnabled = false,
}: UseRealtimeOrdersProps): UseRealtimeOrdersReturn {
  const queryClient = useQueryClient();
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(isEnabled);
  const [connectionStatus, setConnectionStatus] =
    useState<RealtimeConnectionStatus>({
      isConnected: false,
      isRealtimeEnabled: false,
    });

  const eventSourceRef = useRef<EventSource | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (websocketRef.current) {
      try {
        websocketRef.current.close();
      } catch {}
      websocketRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnectionStatus((prev) => ({
      ...prev,
      isConnected: false,
      isRealtimeEnabled: false,
    }));
  }, []);

  const handleIncomingRealtimeMessage = useCallback(
    (data: { type: string; data?: unknown; timestamp?: string }) => {
      switch (data.type) {
        case "connection":
          console.log("Realtime connection established:", data);
          setConnectionStatus((prev) => ({
            ...prev,
            isConnected: true,
            isRealtimeEnabled: true,
            lastUpdate: data.timestamp ? new Date(data.timestamp) : new Date(),
          }));
          toast.success("Realtime bağlantısı kuruldu", {
            description: "Sipariş güncellemeleri canlı olarak takip ediliyor",
            duration: 3000,
          });
          return;
        case "orderUpdate":
          // existing logic moved below to keep diff minimal
          break;
        case "heartbeat":
          setConnectionStatus((prev) => ({
            ...prev,
            lastUpdate: data.timestamp ? new Date(data.timestamp) : new Date(),
          }));
          return;
        case "error":
          console.error("Realtime error:", (data as { error?: string }).error);
          setConnectionStatus((prev) => ({
            ...prev,
            error: (data as { error?: string }).error,
          }));
          toast.error("Realtime bağlantı hatası", {
            description:
              (data as { error?: string }).error || "Bilinmeyen hata oluştu",
            duration: 5000,
          });
          return;
        default:
          console.log("Unknown realtime message type:", data.type);
          return;
      }

      // orderUpdate branch (extracted)
      const update = (data.data || {}) as RealtimeOrderUpdate;
      const updatedOrder = update.fullDocument;
      if (!updatedOrder) return;

      console.log("Realtime order update received:", data);
      console.log("Updating cache with order:", updatedOrder);

      let oldOrderData: unknown = null;

      queryClient.setQueryData(
        QueryKeys.orders(cafeId || ""),
        (oldData: unknown) => {
          console.log("Old cache data:", oldData);

          let ordersArray: unknown[] = [];
          if (oldData && typeof oldData === "object" && "data" in oldData) {
            const apiResponse = oldData as { data: unknown };
            if (Array.isArray(apiResponse.data)) {
              ordersArray = apiResponse.data;
            }
          } else if (Array.isArray(oldData)) {
            ordersArray = oldData;
          }

          oldOrderData = ordersArray.find((order: unknown) => {
            if (typeof order === "object" && order !== null && "id" in order) {
              return (order as { id: string }).id === updatedOrder.id;
            }
            return false;
          });

          if (ordersArray.length === 0) {
            console.log("No existing orders, returning new data");
            return [updatedOrder];
          }

          const updatedOrders = ordersArray.map((order: unknown) => {
            if (typeof order === "object" && order !== null && "id" in order) {
              const orderId = (order as { id: string }).id;
              if (orderId === updatedOrder.id) {
                console.log("Found matching order, updating:", orderId);
                return updatedOrder;
              }
            }
            return order;
          });

          if (update.operationType === "insert") {
            console.log("Insert operation, adding to beginning");
            const newOrders = [updatedOrder, ...ordersArray];
            return { success: true, data: newOrders };
          }

          if (update.operationType === "delete") {
            console.log("Delete operation, removing order");
            const filteredOrders = ordersArray.filter((order: unknown) => {
              if (
                typeof order === "object" &&
                order !== null &&
                "id" in order
              ) {
                return (order as { id: string }).id !== update.documentKey._id;
              }
              return true;
            });
            return { success: true, data: filteredOrders };
          }

          console.log("Updated orders:", updatedOrders);
          return { success: true, data: updatedOrders };
        }
      );

      queryClient.refetchQueries({
        queryKey: QueryKeys.orders(cafeId || ""),
        exact: false,
      });

      const operationType = update.operationType;
      const tableName = updatedOrder.table?.name || "Bilinmeyen Masa";
      const oldOrder = oldOrderData;

      const getOrderChangeMessage = () => {
        if (operationType === "insert") {
          return {
            title: "Yeni sipariş oluşturuldu",
            description: `${tableName} masasına yeni sipariş eklendi`,
            type: "success" as const,
          };
        }
        if (operationType === "delete") {
          return {
            title: "Sipariş silindi",
            description: `${tableName} masasındaki sipariş silindi`,
            type: "warning" as const,
          };
        }
        if (operationType === "update" && oldOrder) {
          const oldProducts =
            (oldOrder as { products?: unknown[] })?.products || [];
          const newProducts = updatedOrder.products || [];
          const oldIsPaid = (oldOrder as { isPaid?: boolean })?.isPaid;
          const newIsPaid = updatedOrder.isPaid;
          if (newProducts.length !== oldProducts.length) {
            if (newProducts.length > oldProducts.length) {
              const addedCount = newProducts.length - oldProducts.length;
              return {
                title: "Ürün eklendi",
                description: `${tableName} masasına ${addedCount} ürün eklendi`,
                type: "success" as const,
              };
            }
            const removedCount = oldProducts.length - newProducts.length;
            return {
              title: "Ürün çıkarıldı",
              description: `${tableName} masasından ${removedCount} ürün çıkarıldı`,
              type: "warning" as const,
            };
          }
          if (oldIsPaid !== newIsPaid) {
            if (newIsPaid) {
              return {
                title: "Sipariş ödendi",
                description: `${tableName} masasındaki sipariş ödendi`,
                type: "success" as const,
              };
            }
            return {
              title: "Ödeme iptal edildi",
              description: `${tableName} masasındaki sipariş ödemesi iptal edildi`,
              type: "warning" as const,
            };
          }
          const oldTotal =
            (oldOrder as { totalAmount?: number })?.totalAmount || 0;
          const newTotal = updatedOrder.totalAmount || 0;
          if (Math.abs(oldTotal - newTotal) > 0.01) {
            return {
              title: "Sipariş tutarı güncellendi",
              description: `${tableName} masasındaki sipariş tutarı değişti`,
              type: "info" as const,
            };
          }
          const paidProductsChanged = newProducts.some(
            (newProduct: unknown, index: number) => {
              const oldProduct = oldProducts[index];
              if (
                typeof newProduct === "object" &&
                newProduct !== null &&
                "isPaid" in newProduct &&
                typeof oldProduct === "object" &&
                oldProduct !== null &&
                "isPaid" in oldProduct
              ) {
                return (
                  (oldProduct as { isPaid: boolean }).isPaid !==
                  (newProduct as { isPaid: boolean }).isPaid
                );
              }
              return false;
            }
          );
          if (paidProductsChanged) {
            return {
              title: "Ürün ödeme durumu güncellendi",
              description: `${tableName} masasındaki ürün ödeme durumu değişti`,
              type: "info" as const,
            };
          }
        }
        return {
          title: "Sipariş güncellendi",
          description: `${tableName} masasındaki sipariş güncellendi`,
          type: "info" as const,
        };
      };

      const message = getOrderChangeMessage();
      switch (message.type) {
        case "success":
          toast.success(message.title, {
            description: message.description,
            duration: 4000,
          });
          break;
        case "warning":
          toast.warning(message.title, {
            description: message.description,
            duration: 3000,
          });
          break;
        case "info":
        default:
          toast.info(message.title, {
            description: message.description,
            duration: 3000,
          });
      }
    },
    [queryClient, cafeId]
  );

  // Connect to realtime stream
  const connect = useCallback(() => {
    if (!cafeId || !isRealtimeEnabled) {
      return;
    }

    cleanup();

    try {
      const wsUrl =
        typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_URL
          ? `${process.env.NEXT_PUBLIC_WS_URL.replace(
              /\/$/,
              ""
            )}?cafeId=${cafeId}`
          : `ws://localhost:3001?cafeId=${cafeId}`;
      console.log(wsUrl);
      if (wsUrl && cafeId) {
        try {
          const ws = new WebSocket(wsUrl);
          websocketRef.current = ws;
          ws.onopen = () => {
            console.log("Realtime WS connection opened");
            setConnectionStatus((prev) => ({
              ...prev,
              isConnected: true,
              isRealtimeEnabled: true,
              error: undefined,
            }));
            toast.success("Realtime bağlantısı kuruldu (WS)", {
              description: "WebSocket ile canlı güncellemeler etkin",
              duration: 2000,
            });
          };
          ws.onmessage = (event: MessageEvent<string>) => {
            const payload = JSON.parse(event.data) as {
              type: string;
              data?: unknown;
              timestamp?: string;
            };
            try {
              handleIncomingRealtimeMessage(payload);
            } catch (e) {
              console.error("Error parsing WS message:", e);
            }
          };
          ws.onerror = (err) => {
            console.error("Realtime WS error:", err);
            setConnectionStatus((prev) => ({
              ...prev,
              isConnected: false,
              error: "WS error",
            }));
            toast.error("Realtime WS hatası", { duration: 2500 });
          };
          ws.onclose = () => {
            setConnectionStatus((prev) => ({ ...prev, isConnected: false }));
            toast.info("Realtime bağlantısı kapandı", { duration: 2000 });
          };
          return;
        } catch (wsError) {
          console.warn(
            "WS initialization failed, falling back to SSE:",
            wsError
          );
        }
      }

      if (!cafeId) return;
      const eventSource = new EventSource(
        `/api/cafes/${cafeId}/orders/realtime`
      );
      eventSourceRef.current = eventSource;
      eventSource.onopen = () => {
        console.log("Realtime connection opened");
        setConnectionStatus((prev) => ({
          ...prev,
          isConnected: true,
          isRealtimeEnabled: true,
          error: undefined,
        }));
      };
      eventSource.onmessage = (event) => {
        try {
          const dataParsed = JSON.parse(event.data);
          handleIncomingRealtimeMessage(dataParsed);
        } catch (error) {
          console.error("Error parsing realtime message:", error);
        }
      };
      eventSource.onerror = (error) => {
        console.error("Realtime connection error:", error);
        setConnectionStatus((prev) => ({
          ...prev,
          isConnected: false,
          error: "Connection error",
        }));
        toast.error("Realtime SSE hatası", { duration: 2500 });
      };
    } catch (error) {
      console.error("Error creating realtime connection:", error);
      setConnectionStatus((prev) => ({
        ...prev,
        error: "Failed to create connection",
      }));
      toast.error("Realtime bağlantısı kurulamadı", {
        description: "Bağlantı kurulurken hata oluştu",
        duration: 3000,
      });
    }
  }, [cafeId, isRealtimeEnabled, cleanup, handleIncomingRealtimeMessage]);

  // Toggle realtime on/off
  const toggleRealtime = useCallback(() => {
    setIsRealtimeEnabled((prev) => {
      const next = !prev;
      if (!next) {
        // Turning off: close connections immediately
        cleanup();
      } else {
        // Turning on: start connection
        connect();
      }
      return next;
    });
  }, [cleanup, connect]);

  // Effect to handle realtime connection
  useEffect(() => {
    if (isRealtimeEnabled && cafeId) {
      connect();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isRealtimeEnabled, cafeId, connect, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    connectionStatus,
    toggleRealtime,
    isRealtimeEnabled,
  };
}
