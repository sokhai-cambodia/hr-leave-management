import { Badge, Box, IconButton } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { FiBell } from "react-icons/fi"

import { MenuContent, MenuRoot, MenuTrigger } from "@/components/ui/menu"
import NotificationDropdown from "./NotificationDropdown"
import { NotificationsService } from "./notificationsService"

const NotificationBell = () => {
  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: NotificationsService.unreadCount,
    refetchInterval: 30_000,
  })

  const unreadCount = data?.count ?? 0

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Box position="relative" data-testid="notification-bell">
          <IconButton variant="ghost" color="inherit" aria-label="Notifications">
            <FiBell fontSize="18" />
          </IconButton>
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              borderRadius="full"
              colorPalette="red"
              fontSize="2xs"
              minW="4"
              px={1}
              textAlign="center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Box>
      </MenuTrigger>
      <MenuContent>
        <NotificationDropdown />
      </MenuContent>
    </MenuRoot>
  )
}

export default NotificationBell
