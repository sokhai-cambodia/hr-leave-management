import { Badge, Container, Flex, Heading, Table, Text } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { OpenAPI } from "@/client/core/OpenAPI"
import AddLeaveBalance from "@/components/LeaveBalance/AddLeaveBalance"
import { LeaveBalanceActionsMenu } from "@/components/Common/LeaveBalanceActionsMenu"
import PendingLeaveBalances from "@/components/Pending/PendingLeaveBalances"
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from "@/components/ui/pagination.tsx"
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogHeader,
    DialogRoot,
    DialogTitle,
} from "@/components/ui/dialog"

// Nested object types for API response
interface LeaveBalanceOwner {
    id: string
    full_name: string
    email: string
}

interface LeaveBalanceLeaveType {
    id: string
    code: string
    name: string
}

// This type will be auto-generated once you regenerate the API client
interface LeaveBalancePublic {
    id: string
    year: string
    balance: number
    taken_balance: number
    available_balance: number
    leave_type_id: string
    owner_id: string
    owner: LeaveBalanceOwner
    leave_type: LeaveBalanceLeaveType
}

interface LeaveBalancesResponse {
    data: LeaveBalancePublic[]
    count: number
}

// Temporary service - will be replaced by auto-generated LeaveBalancesService
const LeaveBalancesService = {
    readLeaveBalances: async ({
        skip,
        limit,
    }: {
        skip?: number
        limit?: number
    }): Promise<LeaveBalancesResponse> => {
        const params = new URLSearchParams()
        if (skip !== undefined) params.append("skip", skip.toString())
        if (limit !== undefined) params.append("limit", limit.toString())

        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-balances?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error("Failed to fetch leave balances")
        }
        return response.json()
    },
}

const leaveBalancesSearchSchema = z.object({
    page: z.number().catch(1),
})

const PER_PAGE = 10

function getLeaveBalancesQueryOptions({ page }: { page: number }) {
    return {
        queryFn: () =>
            LeaveBalancesService.readLeaveBalances({
                skip: (page - 1) * PER_PAGE,
                limit: PER_PAGE,
            }),
        queryKey: ["leave-balances", { page }],
    }
}

export const Route = createFileRoute("/_layout/leave-balances")({
    component: LeaveBalances,
    validateSearch: (search) => leaveBalancesSearchSchema.parse(search),
})

function LeaveBalancesTable() {
    const navigate = useNavigate({ from: Route.fullPath })
    const { page } = Route.useSearch()
    const [selectedBalance, setSelectedBalance] = useState<LeaveBalancePublic | null>(null)

    const { data, isLoading, isPlaceholderData } = useQuery({
        ...getLeaveBalancesQueryOptions({ page }),
        placeholderData: (prevData) => prevData,
    })

    const setPage = (page: number) => {
        navigate({
            to: "/leave-balances",
            search: (prev) => ({ ...prev, page }),
        })
    }

    const leaveBalances = data?.data.slice(0, PER_PAGE) ?? []
    const count = data?.count ?? 0

    if (isLoading) {
        return <PendingLeaveBalances />
    }

    return (
        <>
            <Table.Root size={{ base: "sm", md: "md" }}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Year</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Leave Type</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Owner Name</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Owner Email</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Balance</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Taken</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Available</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {leaveBalances?.map((leaveBalance) => (
                        <Table.Row key={leaveBalance.id} opacity={isPlaceholderData ? 0.5 : 1}>
                            <Table.Cell truncate maxW="sm">{leaveBalance.id}</Table.Cell>
                            <Table.Cell>{leaveBalance.year}</Table.Cell>
                            <Table.Cell truncate maxW="sm">
                                {leaveBalance.leave_type?.name || leaveBalance.leave_type_id}
                            </Table.Cell>
                            <Table.Cell
                                truncate
                                maxW="sm"
                                cursor="pointer"
                                _hover={{ textDecoration: "underline", color: "blue.500" }}
                                onClick={() => setSelectedBalance(leaveBalance)}
                            >
                                {leaveBalance.owner?.full_name || leaveBalance.owner_id}
                            </Table.Cell>
                            <Table.Cell truncate maxW="sm">
                                {leaveBalance.owner?.email || "-"}
                            </Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette="blue">
                                    {leaveBalance.balance}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette="orange">
                                    {leaveBalance.taken_balance}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette={leaveBalance.available_balance > 0 ? "green" : "red"}>
                                    {leaveBalance.available_balance}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <LeaveBalanceActionsMenu leaveBalance={leaveBalance} />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            {/* Dialog to show owner details */}
            <DialogRoot
                size="xs"
                placement="center"
                open={selectedBalance !== null}
                onOpenChange={({ open }) => !open && setSelectedBalance(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Owner Details</DialogTitle>
                    </DialogHeader>
                    <DialogBody pb={4}>
                        <Text fontWeight="bold" mb={1}>Name:</Text>
                        <Text mb={3}>{selectedBalance?.owner?.full_name || "-"}</Text>
                        <Text fontWeight="bold" mb={1}>Email:</Text>
                        <Text mb={3}>{selectedBalance?.owner?.email || "-"}</Text>
                        <Text fontWeight="bold" mb={1}>Owner ID:</Text>
                        <Text fontSize="sm" color="gray.600" wordBreak="break-all">{selectedBalance?.owner_id || "-"}</Text>
                    </DialogBody>
                    <DialogCloseTrigger />
                </DialogContent>
            </DialogRoot>

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

function LeaveBalances() {
    return (
        <Container maxW="full">
            <Heading size="lg" pt={12}>
                Leave Balances Management
            </Heading>

            <AddLeaveBalance />
            <LeaveBalancesTable />
        </Container>
    )
}
