import { Badge, Container, Flex, Heading, Table } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { OpenAPI } from "@/client/core/OpenAPI"
import AddPolicy from "@/components/Policy/AddPolicy"
import { PolicyActionsMenu } from "@/components/Common/PolicyActionsMenu"
import PendingPolicies from "@/components/Pending/PendingPolicies"
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from "@/components/ui/pagination.tsx"

// This type will be auto-generated once you regenerate the API client
interface PolicyPublic {
    code: string
    name: string
    operation: string
    value: string
    score: number
    description: string
    is_active: boolean
    id: string
}

interface PoliciesResponse {
    data: PolicyPublic[]
    count: number
}

// Temporary service - will be replaced by auto-generated PoliciesService
const PoliciesService = {
    readPolicies: async ({
        skip,
        limit,
    }: {
        skip?: number
        limit?: number
    }): Promise<PoliciesResponse> => {
        const params = new URLSearchParams()
        if (skip !== undefined) params.append("skip", skip.toString())
        if (limit !== undefined) params.append("limit", limit.toString())

        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/policies?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error("Failed to fetch policies")
        }
        return response.json()
    },
}

const policiesSearchSchema = z.object({
    page: z.number().catch(1),
})

const PER_PAGE = 10

function getPoliciesQueryOptions({ page }: { page: number }) {
    return {
        queryFn: () =>
            PoliciesService.readPolicies({
                skip: (page - 1) * PER_PAGE,
                limit: PER_PAGE,
            }),
        queryKey: ["policies", { page }],
    }
}

export const Route = createFileRoute("/_layout/policies")({
    component: Policies,
    validateSearch: (search) => policiesSearchSchema.parse(search),
})

function PoliciesTable() {
    const navigate = useNavigate({ from: Route.fullPath })
    const { page } = Route.useSearch()

    const { data, isLoading, isPlaceholderData } = useQuery({
        ...getPoliciesQueryOptions({ page }),
        placeholderData: (prevData) => prevData,
    })

    const setPage = (page: number) => {
        navigate({
            to: "/policies",
            search: (prev) => ({ ...prev, page }),
        })
    }

    const policies = data?.data.slice(0, PER_PAGE) ?? []
    const count = data?.count ?? 0

    if (isLoading) {
        return <PendingPolicies />
    }

    return (
        <>
            <Table.Root size={{ base: "sm", md: "md" }}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Code</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Operation</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Value</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Score</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Description</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {policies?.map((policy) => (
                        <Table.Row key={policy.id} opacity={isPlaceholderData ? 0.5 : 1}>
                            <Table.Cell truncate maxW="xs">{policy.id}</Table.Cell>
                            <Table.Cell>{policy.code}</Table.Cell>
                            <Table.Cell>{policy.name}</Table.Cell>
                            <Table.Cell>{policy.operation}</Table.Cell>
                            <Table.Cell truncate maxW="sm">
                                {policy.value}
                            </Table.Cell>
                            <Table.Cell>{policy.score}</Table.Cell>
                            <Table.Cell truncate maxW="sm">
                                {policy.description}
                            </Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette={policy.is_active ? "green" : "gray"}>
                                    {policy.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <PolicyActionsMenu policy={policy} />
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

function Policies() {
    return (
        <Container maxW="full">
            <Heading size="lg" pt={12}>
                Policies Management
            </Heading>

            <AddPolicy />
            <PoliciesTable />
        </Container>
    )
}
