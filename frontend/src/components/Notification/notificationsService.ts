import { OpenAPI } from "@/client/core/OpenAPI"

export interface NotificationActor {
  id: string
  full_name: string | null
  email: string
}

export type NotificationEntityType = "leave_request" | "leave_plan_request"

export interface NotificationPublic {
  id: string
  event_type: string
  entity_type: NotificationEntityType
  entity_id: string
  message: string
  is_read: boolean
  created_at: string
  actor: NotificationActor | null
}

export interface NotificationsResponse {
  data: NotificationPublic[]
  count: number
  unread_count: number
}

const authHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
})

// Temporary service using OpenAPI.BASE - replace with auto-generated
// NotificationsService once `npm run generate-client` has been run against
// a backend that includes the /notifications routes.
export const NotificationsService = {
  listNotifications: async ({
    limit,
    isRead,
  }: { limit?: number; isRead?: boolean } = {}): Promise<NotificationsResponse> => {
    const baseUrl = OpenAPI.BASE || ""
    const params = new URLSearchParams()
    if (limit !== undefined) params.append("limit", limit.toString())
    if (isRead !== undefined) params.append("is_read", String(isRead))
    const response = await fetch(
      `${baseUrl}/api/v1/notifications/?${params.toString()}`,
      { headers: authHeaders() },
    )
    if (!response.ok) throw new Error("Failed to fetch notifications")
    return response.json()
  },

  unreadCount: async (): Promise<{ count: number }> => {
    const baseUrl = OpenAPI.BASE || ""
    const response = await fetch(`${baseUrl}/api/v1/notifications/unread-count`, {
      headers: authHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch unread count")
    return response.json()
  },

  markRead: async (id: string): Promise<void> => {
    const baseUrl = OpenAPI.BASE || ""
    const response = await fetch(`${baseUrl}/api/v1/notifications/${id}/read`, {
      method: "PUT",
      headers: authHeaders(),
    })
    if (!response.ok) throw new Error("Failed to mark notification as read")
  },

  markAllRead: async (): Promise<void> => {
    const baseUrl = OpenAPI.BASE || ""
    const response = await fetch(
      `${baseUrl}/api/v1/notifications/mark-all-read`,
      { method: "PUT", headers: authHeaders() },
    )
    if (!response.ok) throw new Error("Failed to mark all notifications as read")
  },
}
