import { Box, VStack } from "@chakra-ui/react"
import { Skeleton } from "../ui/skeleton"

const PendingLeaveRequests = () => {
    return (
        <VStack gap={4} mt={2} w="full">
            {Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} w="full">
                    <Skeleton height="28px" />
                </Box>
            ))}
        </VStack>
    )
}

export default PendingLeaveRequests
