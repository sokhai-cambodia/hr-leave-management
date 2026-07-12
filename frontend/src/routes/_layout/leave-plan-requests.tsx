import { Badge, Container, Flex, Heading, Table, Text } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { OpenAPI } from "@/client/core/OpenAPI"
import AddLeavePlanRequest from "@/components/LeavePlanRequest/AddLeavePlanRequest"
import { LeavePlanRequestActionsMenu } from "@/components/Common/LeavePlanRequestActionsMenu"
import PendingLeavePlanRequests from "@/components/Pending/PendingLeavePlanRequests"
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

// Nested user object returned by API
interface UserInfo {
    id: string
    full_name: string
    email: string
}

// Nested leave type object returned by API
interface LeaveTypeInfo {
    id: string
    code: string
    name: string
}

// This type will be auto-generated once you regenerate the API client
interface LeavePlanRequestPublic {
    id: string
    description: string
    leave_type_id: string
    owner_id: string
    approver_id: string | null
    requested_at: string
    submitted_at: string | null
    approved_at: string | null
    status: string
    amount: number
    details: Array<{ leave_date: string }>
    owner: UserInfo
    leave_type: LeaveTypeInfo
    approver: UserInfo | null
}

interface LeavePlanRequestsResponse {
    data: LeavePlanRequestPublic[]
    count: number
}

// Temporary service - will be replaced by auto-generated LeavePlanRequestsService
const LeavePlanRequestsService = {
    readLeavePlanRequests: async ({
        skip,
        limit,
    }: {
        skip?: number
        limit?: number
    }): Promise<LeavePlanRequestsResponse> => {
        const params = new URLSearchParams()
        if (skip !== undefined) params.append("skip", skip.toString())
        if (limit !== undefined) params.append("limit", limit.toString())

        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""

        const response = await fetch(`${baseUrl}/api/v1/leave-plan-requests?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error("Failed to fetch leave plan requests")
        }
        return response.json()
    },
}

const leavePlanRequestsSearchSchema = z.object({
    page: z.number().catch(1),
})

const PER_PAGE = 10

function getLeavePlanRequestsQueryOptions({ page }: { page: number }) {
    return {
        queryFn: () =>
            LeavePlanRequestsService.readLeavePlanRequests({
                skip: (page - 1) * PER_PAGE,
                limit: PER_PAGE,
            }),
        queryKey: ["leave-plan-requests", { page }],
    }
}

export const Route = createFileRoute("/_layout/leave-plan-requests")({
    component: LeavePlanRequests,
    validateSearch: (search) => leavePlanRequestsSearchSchema.parse(search),
})

function LeavePlanRequestsTable() {
    const navigate = useNavigate({ from: Route.fullPath })
    const { page } = Route.useSearch()
    const [selectedRequest, setSelectedRequest] = useState<LeavePlanRequestPublic | null>(null)
    const [popupType, setPopupType] = useState<"description" | "owner" | "approver" | null>(null)

    const openPopup = (request: LeavePlanRequestPublic, type: "description" | "owner" | "approver") => {
        setSelectedRequest(request)
        setPopupType(type)
    }

    const closePopup = () => {
        setSelectedRequest(null)
        setPopupType(null)
    }

    const { data, isLoading, isPlaceholderData } = useQuery({
        ...getLeavePlanRequestsQueryOptions({ page }),
        placeholderData: (prevData) => prevData,
    })

    const setPage = (page: number) => {
        navigate({
            to: "/leave-plan-requests",
            search: (prev) => ({ ...prev, page }),
        })
    }

    const leavePlanRequests = data?.data.slice(0, PER_PAGE) ?? []
    const count = data?.count ?? 0

    if (isLoading) {
        return <PendingLeavePlanRequests />
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "green"
            case "pending":
                return "yellow"
            case "rejected":
                return "red"
            case "draft":
                return "gray"
            default:
                return "gray"
        }
    }

    return (
        <>
            <Table.Root size={{ base: "sm", md: "md" }}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader w="md">Description</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Leave Type</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Approver</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Amount</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Requested At</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Submitted At</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Approved At</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {leavePlanRequests?.map((request) => (
                        <Table.Row key={request.id} opacity={isPlaceholderData ? 0.5 : 1}>
                            <Table.Cell
                                truncate
                                maxW="md"
                                cursor="pointer"
                                _hover={{ textDecoration: "underline", color: "blue.500" }}
                                onClick={() => openPopup(request, "description")}
                            >
                                {request.description}
                            </Table.Cell>
                            <Table.Cell
                                cursor="pointer"
                                _hover={{ textDecoration: "underline", color: "blue.500" }}
                                onClick={() => openPopup(request, "owner")}
                            >
                                {request.owner?.full_name || request.owner?.email || "-"}
                            </Table.Cell>
                            <Table.Cell>
                                {request.leave_type?.name || "-"}
                            </Table.Cell>
                            <Table.Cell
                                cursor="pointer"
                                _hover={{ textDecoration: "underline", color: "blue.500" }}
                                onClick={() => openPopup(request, "approver")}
                            >
                                {request.approver?.full_name || request.approver?.email || "-"}
                            </Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette="blue">{request.amount}</Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette={getStatusColor(request.status)}>
                                    {request.status}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                {new Date(request.requested_at).toLocaleDateString()}
                            </Table.Cell>
                            <Table.Cell>
                                {request.submitted_at
                                    ? new Date(request.submitted_at).toLocaleDateString()
                                    : "-"}
                            </Table.Cell>
                            <Table.Cell>
                                {request.approved_at
                                    ? new Date(request.approved_at).toLocaleDateString()
                                    : "-"}
                            </Table.Cell>
                            <Table.Cell>
                                <LeavePlanRequestActionsMenu leavePlanRequest={request} />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            {/* Dialog to show details based on clicked column */}
            <DialogRoot
                size="xs"
                placement="center"
                open={selectedRequest !== null}
                onOpenChange={({ open }) => !open && closePopup()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {popupType === "description" && "Leave Plan Request Details"}
                            {popupType === "owner" && "Owner Details"}
                            {popupType === "approver" && "Approver Details"}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogBody pb={4}>
                        {popupType === "description" && (
                            <>
                                <Text fontWeight="bold" mb={1}>Description:</Text>
                                <Text mb={3}>{selectedRequest?.description || "-"}</Text>
                                <Text fontWeight="bold" mb={1}>ID:</Text>
                                <Text fontSize="sm" color="gray.600" wordBreak="break-all">{selectedRequest?.id}</Text>
                            </>
                        )}
                        {popupType === "owner" && (
                            <>
                                <Text fontWeight="bold" mb={1}>Name:</Text>
                                <Text mb={3}>{selectedRequest?.owner?.full_name || "-"}</Text>
                                <Text fontWeight="bold" mb={1}>Email:</Text>
                                <Text mb={3}>{selectedRequest?.owner?.email || "-"}</Text>
                                <Text fontWeight="bold" mb={1}>Owner ID:</Text>
                                <Text fontSize="sm" color="gray.600" wordBreak="break-all">{selectedRequest?.owner?.id || selectedRequest?.owner_id || "-"}</Text>
                            </>
                        )}
                        {popupType === "approver" && (
                            <>
                                <Text fontWeight="bold" mb={1}>Name:</Text>
                                <Text mb={3}>{selectedRequest?.approver?.full_name || "-"}</Text>
                                <Text fontWeight="bold" mb={1}>Email:</Text>
                                <Text mb={3}>{selectedRequest?.approver?.email || "-"}</Text>
                                <Text fontWeight="bold" mb={1}>Approver ID:</Text>
                                <Text fontSize="sm" color="gray.600" wordBreak="break-all">{selectedRequest?.approver?.id || selectedRequest?.approver_id || "-"}</Text>
                            </>
                        )}
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

function LeavePlanRequests() {
    return (
        <Container maxW="full">
            <Heading size="lg" pt={12}>
                Leave Plan Requests Management
            </Heading>

            <AddLeavePlanRequest />
            <LeavePlanRequestsTable />
        </Container>
    )
}
