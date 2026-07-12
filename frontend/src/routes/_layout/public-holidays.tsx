import { createFileRoute } from "@tanstack/react-router"
import { Container, Heading, Table } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { OpenAPI } from "@/client/core/OpenAPI"
import AddPublicHoliday from "@/components/PublicHoliday/AddPublicHoliday"
import { PublicHolidayActionsMenu } from "@/components/Common/PublicHolidayActionsMenu"
import PendingPublicHolidays from "@/components/Pending/PendingPublicHolidays"
import useAuth from "@/hooks/useAuth"

// This type will be auto-generated once you regenerate the API client
interface PublicHolidayPublic {
    name: string
    date: string
    description: string
    id: string
}

interface PublicHolidaysResponse {
    data: PublicHolidayPublic[]
    count: number
}

// Temporary service - will be replaced by auto-generated PublicHolidaysService
const PublicHolidaysService = {
    readPublicHolidays: async (): Promise<PublicHolidaysResponse> => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/public-holidays/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error("Failed to fetch public holidays")
        }
        return response.json()
    },
}

function getPublicHolidaysQueryOptions() {
    return {
        queryFn: () => PublicHolidaysService.readPublicHolidays(),
        queryKey: ["public-holidays"],
    }
}

export const Route = createFileRoute("/_layout/public-holidays")({
    component: PublicHolidays,
})

function PublicHolidaysTable({ isSuperuser }: { isSuperuser: boolean }) {
    const { data, isLoading } = useQuery({
        ...getPublicHolidaysQueryOptions(),
    })

    const publicHolidays = data?.data ?? []

    if (isLoading) {
        return <PendingPublicHolidays />
    }

    return (
        <Table.Root size={{ base: "sm", md: "md" }}>
            <Table.Header>
                <Table.Row>
                    {isSuperuser && <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>}
                    <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Date</Table.ColumnHeader>
                    <Table.ColumnHeader w="md">Description</Table.ColumnHeader>
                    {isSuperuser && <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {publicHolidays?.map((publicHoliday) => (
                    <Table.Row key={publicHoliday.id}>
                        {isSuperuser && <Table.Cell>{publicHoliday.id}</Table.Cell>}
                        <Table.Cell>{publicHoliday.name}</Table.Cell>
                        <Table.Cell>{publicHoliday.date}</Table.Cell>
                        <Table.Cell truncate maxW="md">
                            {publicHoliday.description}
                        </Table.Cell>
                        {isSuperuser && (
                            <Table.Cell>
                                <PublicHolidayActionsMenu publicHoliday={publicHoliday} />
                            </Table.Cell>
                        )}
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}

function PublicHolidays() {
    const { user } = useAuth()
    const isSuperuser = user?.is_superuser ?? false

    return (
        <Container maxW="full">
            <Heading size="lg" pt={12} pb={6}>
                Public Holidays Management
            </Heading>

            {isSuperuser && <AddPublicHoliday />}
            <PublicHolidaysTable isSuperuser={isSuperuser} />
        </Container>
    )
}
