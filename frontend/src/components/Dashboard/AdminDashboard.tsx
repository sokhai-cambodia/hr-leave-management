import { Card, Container, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react"
import { Link as RouterLink } from "@tanstack/react-router"
import { FiCalendar, FiCreditCard, FiFileText, FiSend, FiSettings, FiTrendingUp, FiUsers } from "react-icons/fi"

const AdminDashboard = () => {
    const tiles = [
        { icon: FiUsers, title: "Users", description: "Manage users and roles", to: "/admin" },
        { icon: FiUsers, title: "Teams", description: "Organize users into teams", to: "/teams" },
        { icon: FiFileText, title: "Leave Types", description: "Configure leave categories", to: "/leave-types" },
        { icon: FiFileText, title: "Policies", description: "Define company policies", to: "/policies" },
        { icon: FiCalendar, title: "Public Holidays", description: "Set official holidays", to: "/public-holidays" },
        { icon: FiCreditCard, title: "Leave Balances", description: "Allocate and adjust balances", to: "/leave-balances" },
        { icon: FiSend, title: "Leave Plan Requests", description: "Review planning requests", to: "/leave-plan-requests" },
        { icon: FiSend, title: "Leave Requests", description: "Approve or reject leaves", to: "/leave-requests" },
        { icon: FiTrendingUp, title: "Recommendations", description: "View AI suggestions", to: "/recommendations" },
        { icon: FiSettings, title: "User Settings", description: "Profile and preferences", to: "/settings" },
    ]

    return (
        <Container maxW="full" px={{ base: 2, md: 4 }}>
            <Heading size="md" mb={4}>
                Quick admin actions
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
                {tiles.map(({ icon: Icon, title, description, to }) => (
                    <Card.Root key={title}>
                        <Card.Body>
                            <RouterLink to={to} style={{ textDecoration: "none" }}>
                                <Flex alignItems="center" gap={3} mb={2}>
                                    <Icon size={20} />
                                    <Heading size="sm">{title}</Heading>
                                </Flex>
                                <Text color="fg.muted" fontSize="sm">{description}</Text>
                            </RouterLink>
                        </Card.Body>
                    </Card.Root>
                ))}
            </SimpleGrid>
        </Container>
    )
}

export default AdminDashboard
