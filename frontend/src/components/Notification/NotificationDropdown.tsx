import { Box, Button, Flex, Spinner, Text, VStack } from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { MenuItem, MenuSeparator } from "@/components/ui/menu"
import {
  type NotificationEntityType,
  type NotificationPublic,
  NotificationsService,
} from "./notificationsService"

const ENTITY_ROUTE: Record<NotificationEntityType, string> = {
  leave_request: "/leave-requests",
  leave_plan_request: "/leave-plan-requests",
}

const NotificationDropdown = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => NotificationsService.listNotifications({ limit: 10 }),
  })

  const notifications = data?.data ?? []

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] })
  }

  const handleItemClick = async (notification: NotificationPublic) => {
    if (!notification.is_read) {
      await NotificationsService.markRead(notification.id)
      invalidate()
    }
    navigate({ to: ENTITY_ROUTE[notification.entity_type] })
  }

  const handleMarkAllRead = async () => {
    await NotificationsService.markAllRead()
    invalidate()
  }

  return (
    <Box minW="320px" maxH="400px" overflowY="auto">
      <Flex justify="space-between" align="center" px={3} py={2}>
        <Text fontWeight="semibold">Notifications</Text>
        <Button
          size="xs"
          variant="ghost"
          onClick={handleMarkAllRead}
          disabled={notifications.every((n) => n.is_read)}
        >
          Mark all as read
        </Button>
      </Flex>
      <MenuSeparator />
      {isLoading ? (
        <Flex justify="center" py={4}>
          <Spinner size="sm" />
        </Flex>
      ) : notifications.length === 0 ? (
        <Text color="gray.500" px={3} py={4} fontSize="sm">
          No notifications yet.
        </Text>
      ) : (
        notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            value={notification.id}
            onClick={() => handleItemClick(notification)}
            style={{ cursor: "pointer" }}
            bg={notification.is_read ? undefined : "bg.subtle"}
            whiteSpace="normal"
            py={2}
          >
            <VStack gap={0} align="start" w="full">
              <Text
                fontSize="sm"
                fontWeight={notification.is_read ? "normal" : "semibold"}
              >
                {notification.message}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {new Date(notification.created_at).toLocaleString()}
              </Text>
            </VStack>
          </MenuItem>
        ))
      )}
    </Box>
  )
}

export default NotificationDropdown
