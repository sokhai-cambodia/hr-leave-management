import { Badge, Container, Flex, Heading, Table } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { OpenAPI } from "@/client/core/OpenAPI"
import AddLeaveType from "@/components/LeaveType/AddLeaveType"
import { LeaveTypeActionsMenu } from "@/components/Common/LeaveTypeActionsMenu"
import PendingLeaveTypes from "@/components/Pending/PendingLeaveTypes"
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from "@/components/ui/pagination.tsx"

interface LeaveTypePublic {
    code: string
    name: string
    entitlement: number
    description: string
    is_allow_plan: boolean
    is_active: boolean
    id: string
}

interface LeaveTypesResponse {
    data: LeaveTypePublic[]
    count: number
}

// Temporary service - will be replaced by auto-generated LeaveTypesService
const LeaveTypesService = {
    readLeaveTypes: async ({
        skip,
        limit,
    }: {
        skip?: number
        limit?: number
    }): Promise<LeaveTypesResponse> => {
        const params = new URLSearchParams()
        if (skip !== undefined) params.append("skip", skip.toString())
        if (limit !== undefined) params.append("limit", limit.toString())

        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-types?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error("Failed to fetch leave types")
        }
        return response.json()
    },
}

const leaveTypesSearchSchema = z.object({
    page: z.number().catch(1),
})

const PER_PAGE = 10

function getLeaveTypesQueryOptions({ page }: { page: number }) {
    return {
        queryFn: () =>
            LeaveTypesService.readLeaveTypes({
                skip: (page - 1) * PER_PAGE,
                limit: PER_PAGE,
            }),
        queryKey: ["leave-types", { page }],
    }
}

export const Route = createFileRoute("/_layout/leave-types")({
    component: LeaveTypes,
    validateSearch: (search) => leaveTypesSearchSchema.parse(search),
})

function LeaveTypesTable() {
    const navigate = useNavigate({ from: Route.fullPath })
    const { page } = Route.useSearch()

    const { data, isLoading, isPlaceholderData } = useQuery({
        ...getLeaveTypesQueryOptions({ page }),
        placeholderData: (prevData) => prevData,
    })

    const setPage = (page: number) => {
        navigate({
            to: "/leave-types",
            search: (prev) => ({ ...prev, page }),
        })
    }

    const leaveTypes = data?.data.slice(0, PER_PAGE) ?? []
    const count = data?.count ?? 0

    if (isLoading) {
        return <PendingLeaveTypes />
    }

    return (
        <>
            <Table.Root size={{ base: "sm", md: "md" }}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Code</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Entitlement</Table.ColumnHeader>
                        <Table.ColumnHeader w="md">Description</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Allow Plan</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {leaveTypes?.map((leaveType) => (
                        <Table.Row key={leaveType.id} opacity={isPlaceholderData ? 0.5 : 1}>
                            <Table.Cell>{leaveType.id}</Table.Cell>
                            <Table.Cell>{leaveType.code}</Table.Cell>
                            <Table.Cell>{leaveType.name}</Table.Cell>
                            <Table.Cell>{leaveType.entitlement}</Table.Cell>
                            <Table.Cell truncate maxW="md">
                                {leaveType.description}
                            </Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette={leaveType.is_allow_plan ? "blue" : "gray"}>
                                    {leaveType.is_allow_plan ? "Yes" : "No"}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette={leaveType.is_active ? "green" : "gray"}>
                                    {leaveType.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <LeaveTypeActionsMenu leaveType={leaveType} />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
            <Flex justifyContent="flex-end" mt={4}>
                <PaginationRoot
                    count={count}
                    pageSize={PER_PAGE}
                    onPageChange={({ page }) => setPage(page)}
                >
                    <Flex>
                        <PaginationPrevTrigger />
                        <PaginationItems />
                        <PaginationNextTrigger />
                    </Flex>
                </PaginationRoot>
            </Flex>
        </>
    )
}

function LeaveTypes() {
    return (
        <Container maxW="full">
            <Heading size="lg" pt={12}>
                Leave Types Management
            </Heading>

            <AddLeaveType />
            <LeaveTypesTable />
        </Container>
    )
}
