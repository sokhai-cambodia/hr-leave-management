import { Badge, Container, Heading, Table, Text } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { TeamsService } from "@/client/TeamsService"
import AddTeam from "@/components/Team/AddTeam"
import { TeamActionsMenu } from "@/components/Common/TeamActionsMenu"
import PendingTeams from "@/components/Pending/PendingTeams"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"

function getTeamsQueryOptions() {
  return {
    queryFn: () =>
      TeamsService.readTeams({
        skip: 0,
        limit: 1000,
      }),
    queryKey: ["teams"],
  }
}

export const Route = createFileRoute("/_layout/teams")({
  component: Teams,
})

function TeamsTable() {
  const [selectedTeam, setSelectedTeam] = useState<typeof teams[0] | null>(null)

  const { data, isLoading } = useQuery({
    ...getTeamsQueryOptions(),
  })

  const teams = data?.data ?? []

  if (isLoading) return <PendingTeams />
  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Description</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Owner Name</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Owner Email</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Members</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {teams?.map((team) => (
            <Table.Row key={team.id}>
              <Table.Cell
                cursor="pointer"
                _hover={{ textDecoration: "underline", color: "blue.500" }}
                onClick={() => setSelectedTeam(team)}
              >
                {team.name}
              </Table.Cell>
              <Table.Cell>{team.description || ""}</Table.Cell>
              <Table.Cell>
                {team.team_owner?.full_name || team.full_name || team.team_owner_id}
              </Table.Cell>
              <Table.Cell>{team.team_owner?.email || team.email || ""}</Table.Cell>
              <Table.Cell>{team.team_members?.length ?? 0}</Table.Cell>
              <Table.Cell>
                <Badge colorPalette={team.is_active ? "green" : "gray"}>
                  {team.is_active ? "Active" : "Inactive"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <TeamActionsMenu team={team} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Dialog to show team ID */}
      <DialogRoot
        size="xs"
        placement="center"
        open={selectedTeam !== null}
        onOpenChange={({ open }) => !open && setSelectedTeam(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Details</DialogTitle>
          </DialogHeader>
          <DialogBody pb={4}>
            <Text fontWeight="bold" mb={1}>Team Name:</Text>
            <Text mb={3}>{selectedTeam?.name || "-"}</Text>
            <Text fontWeight="bold" mb={1}>Team ID:</Text>
            <Text fontSize="sm" color="gray.600" wordBreak="break-all">{selectedTeam?.id || "-"}</Text>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </>
  )
}

function Teams() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>Teams Management</Heading>
      <AddTeam />
      <TeamsTable />
    </Container>
  )
}
