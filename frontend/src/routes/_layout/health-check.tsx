import {
    Box,
    Button,
    Container,
    Flex,
    HStack,
    Heading,
    Input,
    Spinner,
    Stack,
    Text,
    VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FiCheckCircle, FiMail, FiXCircle } from "react-icons/fi"

import { UtilsService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { Field } from "@/components/ui/field"

interface TestEmailForm {
    email: string
}

function HealthCheck() {
    const { showSuccessToast } = useCustomToast()
    const [lastTestEmail, setLastTestEmail] = useState<string | null>(null)

    // Health Check Query
    const {
        data: healthStatus,
        isLoading: isLoadingHealth,
        error: healthError,
        refetch: refetchHealth,
    } = useQuery({
        queryKey: ["health-check"],
        queryFn: () => UtilsService.healthCheck(),
        retry: 1,
    })

    // Test Email Form
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TestEmailForm>({
        mode: "onBlur",
    })

    // Test Email Mutation
    const testEmailMutation = useMutation({
        mutationFn: (email: string) =>
            UtilsService.testEmail({ emailTo: email }),
        onSuccess: (data) => {
            showSuccessToast(data.message)
            setLastTestEmail(null)
            reset()
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
    })

    const onSubmitTestEmail = (data: TestEmailForm) => {
        setLastTestEmail(data.email)
        testEmailMutation.mutate(data.email)
    }

    return (
        <Container maxW="full">
            <Heading size="lg" textAlign={{ base: "center", md: "left" }} py={12}>
                Health Check
            </Heading>

            <Stack gap={8}>
                {/* API Health Status */}
                <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    p={6}
                    bg="bg.panel"
                >
                    <VStack align="stretch" gap={4}>
                        <Flex justify="space-between" align="center">
                            <Heading size="md">API Health Status</Heading>
                            <Button
                                size="sm"
                                onClick={() => refetchHealth()}
                                disabled={isLoadingHealth}
                            >
                                Refresh
                            </Button>
                        </Flex>

                        {isLoadingHealth ? (
                            <Flex justify="center" py={8}>
                                <Spinner size="lg" />
                            </Flex>
                        ) : healthError ? (
                            <Flex align="center" gap={3} color="red.500">
                                <FiXCircle size={24} />
                                <Box>
                                    <Text fontWeight="bold">API is not responding</Text>
                                    <Text fontSize="sm" color="fg.muted">
                                        The health check endpoint returned an error
                                    </Text>
                                </Box>
                            </Flex>
                        ) : healthStatus ? (
                            <Flex align="center" gap={3} color="green.500">
                                <FiCheckCircle size={24} />
                                <Box>
                                    <Text fontWeight="bold">API is healthy</Text>
                                    <Text fontSize="sm" color="fg.muted">
                                        All systems operational
                                    </Text>
                                </Box>
                            </Flex>
                        ) : (
                            <Flex align="center" gap={3} color="orange.500">
                                <FiXCircle size={24} />
                                <Box>
                                    <Text fontWeight="bold">Unknown status</Text>
                                    <Text fontSize="sm" color="fg.muted">
                                        Unable to determine health status
                                    </Text>
                                </Box>
                            </Flex>
                        )}
                    </VStack>
                </Box>

                {/* Test Email */}
                <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    p={6}
                    bg="bg.panel"
                >
                    <VStack align="stretch" gap={4}>
                        <Heading size="md">Test Email</Heading>
                        <Text fontSize="sm" color="fg.muted">
                            Send a test email to verify email functionality is working correctly.
                        </Text>

                        <form onSubmit={handleSubmit(onSubmitTestEmail)}>
                            <Stack gap={4}>
                                <Field
                                    label="Email Address"
                                    invalid={!!errors.email}
                                    errorText={errors.email?.message}
                                >
                                    <Input
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                        placeholder="test@example.com"
                                        type="email"
                                    />
                                </Field>

                                <HStack>
                                    <Button
                                        type="submit"
                                        colorPalette="blue"
                                        disabled={testEmailMutation.isPending}
                                    >
                                        {testEmailMutation.isPending ? (
                                            <>
                                                <Spinner size="sm" mr={2} />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <FiMail />
                                                Send Test Email
                                            </>
                                        )}
                                    </Button>
                                </HStack>

                                {lastTestEmail && testEmailMutation.isPending && (
                                    <Text fontSize="sm" color="fg.muted">
                                        Sending test email to {lastTestEmail}...
                                    </Text>
                                )}
                            </Stack>
                        </form>
                    </VStack>
                </Box>
            </Stack>
        </Container>
    )
}

export const Route = createFileRoute("/_layout/health-check")({
    component: HealthCheck,
})
