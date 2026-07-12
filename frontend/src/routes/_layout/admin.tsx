import { Badge, Container, Flex, Heading, Input, Popover, Table, Text } from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useDeferredValue, useMemo, useState } from "react"
import { FiSearch } from "react-icons/fi"

import { type UserPublic, UsersService } from "@/client"
import AddUser from "@/components/Admin/AddUser"
import { UserActionsMenu } from "@/components/Common/UserActionsMenu"
import PendingUsers from "@/components/Pending/PendingUsers"
import { InputGroup } from "@/components/ui/input-group"

function getUsersQueryOptions() {
  return {
    queryFn: () =>
      UsersService.readUsers({ limit: 10000 }),
    queryKey: ["users"],
  }
}

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,
})

function UsersTable() {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const [filterText, setFilterText] = useState("")
  const deferredFilterText = useDeferredValue(filterText)

  const { data, isLoading } = useQuery({
    ...getUsersQueryOptions(),
  })

  const users = data?.data ?? []

  const filteredUsers = useMemo(() => {
    if (!deferredFilterText.trim()) return users
    const searchTerm = deferredFilterText.toLowerCase()
    return users.filter((user) => {
      const fullName = user.full_name?.toLowerCase() || ""
      const email = user.email.toLowerCase()
      const teamName = user.team?.name?.toLowerCase() || ""
      const teamOwnerName = user.team?.team_owner?.full_name?.toLowerCase() || ""
      const teamOwnerEmail = user.team?.team_owner?.email?.toLowerCase() || ""
      return (
        fullName.includes(searchTerm) ||
        email.includes(searchTerm) ||
        teamName.includes(searchTerm) ||
        teamOwnerName.includes(searchTerm) ||
        teamOwnerEmail.includes(searchTerm)
      )
    })
  }, [users, deferredFilterText])

  if (isLoading) {
    return <PendingUsers />
  }

  return (
    <>
      <Flex mb={4}>
        <InputGroup flex="1" maxW="sm" startElement={<FiSearch />}>
          <Input
            placeholder="Search by name, email, team..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </InputGroup>
      </Flex>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">Full name</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Email</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Team</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Team Owner Name</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Team Owner Email</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Super User</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filteredUsers.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell color={!user.full_name ? "gray" : "inherit"}>
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <Text
                      as="span"
                      cursor="pointer"
                      textDecoration="underline"
                      textDecorationStyle="dotted"
                      _hover={{ color: "blue.500" }}
                    >
                      {user.full_name || "N/A"}
                    </Text>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Arrow />
                      <Popover.Body>
                        <Text fontWeight="bold" mb={1}>User ID:</Text>
                        <Text fontSize="sm" wordBreak="break-all">{user.id}</Text>
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
                {currentUser?.id === user.id && (
                  <Badge ml="1" colorScheme="teal">
                    You
                  </Badge>
                )}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {user.email}
              </Table.Cell>
              <Table.Cell>
                {user.team ? (
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <Text
                        as="span"
                        cursor="pointer"
                        textDecoration="underline"
                        textDecorationStyle="dotted"
                        _hover={{ color: "blue.500" }}
                      >
                        {user.team.name}
                      </Text>
                    </Popover.Trigger>
                    <Popover.Positioner>
                      <Popover.Content>
                        <Popover.Arrow />
                        <Popover.Body>
                          <Text fontWeight="bold" mb={1}>Team ID:</Text>
                          <Text fontSize="sm" wordBreak="break-all">{user.team.id}</Text>
                        </Popover.Body>
                      </Popover.Content>
                    </Popover.Positioner>
                  </Popover.Root>
                ) : (
                  ""
                )}
              </Table.Cell>
              <Table.Cell>
                {user.team?.team_owner ? (
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <Text
                        as="span"
                        cursor="pointer"
                        textDecoration="underline"
                        textDecorationStyle="dotted"
                        _hover={{ color: "blue.500" }}
                      >
                        {user.team.team_owner.full_name}
                      </Text>
                    </Popover.Trigger>
                    <Popover.Positioner>
                      <Popover.Content>
                        <Popover.Arrow />
                        <Popover.Body>
                          <Text fontWeight="bold" mb={1}>Team Owner ID:</Text>
                          <Text fontSize="sm" wordBreak="break-all">{user.team.team_owner.id}</Text>
                        </Popover.Body>
                      </Popover.Content>
                    </Popover.Positioner>
                  </Popover.Root>
                ) : (
                  ""
                )}
              </Table.Cell>
              <Table.Cell>
                {user.team?.team_owner?.email || ""}
              </Table.Cell>
              <Table.Cell>
                {user.is_superuser ? (
                  <Badge colorPalette="purple">Yes</Badge>
                ) : (
                  ""
                )}
              </Table.Cell>
              <Table.Cell>
                <Badge colorPalette={user.is_active ? "green" : "gray"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <UserActionsMenu
                  user={user}
                  disabled={currentUser?.id === user.id}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      {filteredUsers.length === 0 && (
        <Text py={4} textAlign="center" color="gray.500">
          No users found matching your search.
        </Text>
      )}
    </>
  )
}

function Admin() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Users Management
      </Heading>

      <AddUser />
      <UsersTable />
    </Container>
  )
}
