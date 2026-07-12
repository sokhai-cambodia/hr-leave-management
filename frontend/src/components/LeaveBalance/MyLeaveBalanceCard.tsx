import { Badge, Card, Flex, Heading, Skeleton, Text, VStack } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { OpenAPI } from "@/client/core/OpenAPI"

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
    readMyLeaveBalance: async (): Promise<LeaveBalancesResponse> => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-balances/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error("Failed to fetch my leave balance")
        }
        return response.json()
    },
}

/**
 * MyLeaveBalanceCard - Display current user's leave balances
 * 
 * This component can be used on the dashboard or anywhere you need
 * to show the current user's leave balances.
 * 
 * Usage:
 * ```tsx
 * import MyLeaveBalanceCard from "@/components/LeaveBalance/MyLeaveBalanceCard"
 * 
 * function Dashboard() {
 *   return (
 *     <Container>
 *       <MyLeaveBalanceCard />
 *     </Container>
 *   )
 * }
 * ```
 */
const MyLeaveBalanceCard = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["my-leave-balance"],
        queryFn: LeaveBalancesService.readMyLeaveBalance,
    })

    if (error) {
        return (
            <Card.Root>
                <Card.Body>
                    <VStack gap={2} alignItems="flex-start">
                        <Heading size="md">My Leave Balances</Heading>
                        <Text color="red.500">
                            Unable to load leave balances. Please try again later.
                        </Text>
                    </VStack>
                </Card.Body>
            </Card.Root>
        )
    }

    const leaveBalances = data?.data ?? []

    return (
        <Card.Root>
            <Card.Body>
                <VStack gap={4} alignItems="flex-start">
                    <Heading size="md">My Leave Balances</Heading>

                    {isLoading ? (
                        <VStack gap={2} w="full">
                            <Skeleton height="20px" width="150px" />
                            <Skeleton height="40px" width="100px" />
                        </VStack>
                    ) : leaveBalances.length === 0 ? (
                        <Text color="gray.500">No leave balances found.</Text>
                    ) : (
                        <VStack gap={4} w="full" alignItems="stretch">
                            {leaveBalances.map((leaveBalance) => (
                                <Card.Root key={leaveBalance.id} variant="outline" size="sm">
                                    <Card.Body>
                                        <Flex gap={4} alignItems="center" justifyContent="space-between" wrap="wrap">
                                            <VStack gap={1} alignItems="flex-start">
                                                <Text fontWeight="semibold">
                                                    {leaveBalance.leave_type?.name || "Unknown Type"}
                                                </Text>
                                                <Flex gap={2} alignItems="center">
                                                    <Text fontSize="sm" color="gray.500">
                                                        Year:
                                                    </Text>
                                                    <Badge colorPalette="blue">{leaveBalance.year}</Badge>
                                                </Flex>
                                            </VStack>

                                            <Flex gap={4} alignItems="center">
                                                <VStack gap={0} alignItems="center">
                                                    <Text fontSize="xs" color="gray.500">Total</Text>
                                                    <Badge colorPalette="blue" fontSize="md" px={2}>
                                                        {leaveBalance.balance}
                                                    </Badge>
                                                </VStack>
                                                <VStack gap={0} alignItems="center">
                                                    <Text fontSize="xs" color="gray.500">Taken</Text>
                                                    <Badge colorPalette="orange" fontSize="md" px={2}>
                                                        {leaveBalance.taken_balance}
                                                    </Badge>
                                                </VStack>
                                                <VStack gap={0} alignItems="center">
                                                    <Text fontSize="xs" color="gray.500">Available</Text>
                                                    <Badge
                                                        colorPalette={leaveBalance.available_balance > 0 ? "green" : "red"}
                                                        fontSize="md"
                                                        px={2}
                                                    >
                                                        {leaveBalance.available_balance}
                                                    </Badge>
                                                </VStack>
                                            </Flex>
                                        </Flex>
                                    </Card.Body>
                                </Card.Root>
                            ))}
                        </VStack>
                    )}
                </VStack>
            </Card.Body>
        </Card.Root>
    )
}

export default MyLeaveBalanceCard
