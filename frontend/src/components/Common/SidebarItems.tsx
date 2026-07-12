import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"
import { FiCalendar, FiCreditCard, FiFileText, FiHome, FiSend, FiSettings, FiTrendingUp, FiUsers } from "react-icons/fi"
import type { IconType } from "react-icons/lib"

import type { UserPublic } from "@/client"

// Menu items for regular users (normal privilege)
// Updated to show only the specified menus for normal users
const userItems = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  { icon: FiCalendar, title: "Public Holidays", path: "/public-holidays" },
  { icon: FiSend, title: "Leave Plan Requests", path: "/leave-plan-requests" },
  { icon: FiSend, title: "Leave Requests", path: "/leave-requests" },
  { icon: FiTrendingUp, title: "Recommendations", path: "/recommendations" },
  { icon: FiSettings, title: "User Settings", path: "/settings" },
]

// Additional menu items for superusers (admin privilege)
const superuserItems = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  { icon: FiFileText, title: "Policies", path: "/policies" },
  { icon: FiCalendar, title: "Public Holidays", path: "/public-holidays" },
  { icon: FiFileText, title: "Leave Types", path: "/leave-types" },
  { icon: FiUsers, title: "Teams", path: "/teams" },
  { icon: FiCreditCard, title: "Leave Balances", path: "/leave-balances" },
  { icon: FiSend, title: "Leave Plan Requests", path: "/leave-plan-requests" },
  { icon: FiSend, title: "Leave Requests", path: "/leave-requests" },
  { icon: FiTrendingUp, title: "Recommendations", path: "/recommendations" },
  { icon: FiUsers, title: "Admin", path: "/admin" },
  { icon: FiSettings, title: "User Settings", path: "/settings" },
]

interface SidebarItemsProps {
  onClose?: () => void
}

interface Item {
  icon: IconType
  title: string
  path: string
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])

  // Select menu items based on user role
  const finalItems: Item[] = currentUser?.is_superuser
    ? superuserItems
    : userItems

  const listItems = finalItems.map(({ icon, title, path }) => (
    <RouterLink key={title} to={path} onClick={onClose}>
      <Flex
        gap={4}
        px={4}
        py={2}
        _hover={{
          background: "gray.subtle",
        }}
        alignItems="center"
        fontSize="sm"
      >
        <Icon as={icon} alignSelf="center" />
        <Text ml={2}>{title}</Text>
      </Flex>
    </RouterLink>
  ))

  return (
    <>
      <Text fontSize="xs" px={4} py={2} fontWeight="bold">
        Menu
      </Text>
      <Box>{listItems}</Box>
    </>
  )
}

export default SidebarItems
