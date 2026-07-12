import { Button, Card, Container, Flex, Heading, SimpleGrid } from "@chakra-ui/react"
import { useNavigate } from "@tanstack/react-router"
import { FiCalendar, FiSend, FiSettings, FiTrendingUp } from "react-icons/fi"

import MyLeaveBalanceCard from "@/components/LeaveBalance/MyLeaveBalanceCard"

const UserDashboard = () => {
    const navigate = useNavigate()
    const actions = [
        { icon: FiSend, label: "Plan Leave", to: "/leave-plan-requests" },
        { icon: FiSend, label: "Request Leave", to: "/leave-requests" },
        { icon: FiCalendar, label: "Public Holidays", to: "/public-holidays" },
        { icon: FiTrendingUp, label: "Recommendations", to: "/recommendations" },
        { icon: FiSettings, label: "Settings", to: "/settings" },
    ]

    return (
        <Container maxW="full" px={{ base: 2, md: 4 }}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <MyLeaveBalanceCard />
                <Card.Root>
                    <Card.Body>
                        <Heading size="md" mb={4}>
                            Quick actions
                        </Heading>
                        <Flex wrap="wrap" gap={3}>
                            {actions.map(({ icon: Icon, label, to }) => (
                                <Button key={label} variant="subtle" onClick={() => navigate({ to })}>
                                    <Icon size={16} />
                                    {label}
                                </Button>
                            ))}
                        </Flex>
                    </Card.Body>
                </Card.Root>
            </SimpleGrid>
        </Container>
    )
}

export default UserDashboard
