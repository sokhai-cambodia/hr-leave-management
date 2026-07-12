import {
    Button,
    DialogActionTrigger,
    DialogTitle,
    Input,
    Text,
    Textarea,
    VStack,
    IconButton,
    Flex,
    Spinner,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus, FaTrash } from "react-icons/fa"
import type { ApiError } from "@/client/core/ApiError"
import LeaveTypesService from "@/client/LeaveTypesService"
import { OpenAPI } from "@/client/core/OpenAPI"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"
import { Select } from "../ui/select"

interface LeavePlanRequestCreate {
    description: string
    leave_type_id: string
}

interface LeavePlanRequestPayload extends LeavePlanRequestCreate {
    details: Array<{ leave_date: string }>
}

interface RecommendationItem {
    leave_date: string
    bridge_holiday: boolean
    team_workload: number
    preference_score: number
    predicted_score: number
}

interface RecommendationsResponse {
    data: RecommendationItem[]
}

// Temporary service - will be replaced by auto-generated LeavePlanRequestsService
const LeavePlanRequestsService = {
    createLeavePlanRequest: async ({
        requestBody,
    }: {
        requestBody: LeavePlanRequestPayload
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-plan-requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ detail: "Failed to create leave plan request" }))
            const error = new Error("Failed to create leave plan request") as any
            error.body = errorBody
            throw error
        }
        return response.json()
    },
}

// Temporary service for recommendations
const RecommendationsService = {
    getRecommendations: async ({
        year,
    }: {
        year?: number
    }): Promise<RecommendationsResponse> => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const params = new URLSearchParams()
        if (year !== undefined) params.append("year", year.toString())

        const response = await fetch(
            `${baseUrl}/api/v1/recommends/leave-plan${params.toString() ? `?${params}` : ""}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        if (!response.ok) {
            throw new Error("Failed to fetch recommendations")
        }
        return response.json()
    },
}

const AddLeavePlanRequest = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [hasPopulatedDates, setHasPopulatedDates] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const [leaveDates, setLeaveDates] = useState<string[]>([])
    const [newDate, setNewDate] = useState("")

    // Fetch leave types for dropdown
    const { data: leaveTypesData } = useQuery({
        queryKey: ["leave-types"],
        queryFn: () => LeaveTypesService.readLeaveTypes({ skip: 0, limit: 100 }),
    })

    // Fetch recommendations only once when dialog is first opened
    const { data: recommendationsData, isFetching: isLoadingRecommendations, isFetched } = useQuery({
        queryKey: ["leave-plan-recommendations"],
        queryFn: () => RecommendationsService.getRecommendations({ year: new Date().getFullYear() }),
        enabled: isOpen && !hasPopulatedDates, // Only fetch if not already populated
        staleTime: Infinity, // Never refetch automatically
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    })

    // Auto-populate leave dates from recommendations when data is loaded (only once)
    useEffect(() => {
        if (isOpen && !hasPopulatedDates && isFetched && recommendationsData?.data && recommendationsData.data.length > 0) {
            const recommendedDates = recommendationsData.data.map(item => item.leave_date)
            setLeaveDates(recommendedDates)
            setHasPopulatedDates(true)
        }
    }, [isOpen, recommendationsData, hasPopulatedDates, isFetched])

    const leaveTypes = leaveTypesData?.data || []
    const leaveTypeOptions = leaveTypes
        .filter(lt => lt.is_active && lt.is_allow_plan)
        .map(lt => ({
            value: lt.id,
            label: lt.name,
        }))

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<LeavePlanRequestCreate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            description: "",
            leave_type_id: "",
        },
    })

    const handleAddDate = () => {
        if (newDate && !leaveDates.includes(newDate)) {
            setLeaveDates([...leaveDates, newDate])
            setNewDate("")
        }
    }

    const handleRemoveDate = (dateToRemove: string) => {
        setLeaveDates(leaveDates.filter(date => date !== dateToRemove))
    }

    const handleReset = () => {
        reset()
        setLeaveDates([])
        setNewDate("")
        setHasPopulatedDates(false)
        // Invalidate recommendations cache so it fetches fresh data next time
        queryClient.removeQueries({ queryKey: ["leave-plan-recommendations"] })
    }

    const mutation = useMutation({
        mutationFn: (data: LeavePlanRequestPayload) =>
            LeavePlanRequestsService.createLeavePlanRequest({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Leave plan request created successfully.")
            handleReset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-plan-requests"] })
        },
    })

    const onSubmit: SubmitHandler<LeavePlanRequestCreate> = (data) => {
        // Convert leaveDates array to details format
        const details = leaveDates.map(date => ({ leave_date: date }))
        mutation.mutate({
            ...data,
            details,
        })
    }

    return (
        <DialogRoot
            size={{ base: "xs", md: "md" }}
            placement="center"
            open={isOpen}
            onOpenChange={({ open }) => {
                setIsOpen(open)
                if (!open) {
                    handleReset()
                }
            }}
        >
            <DialogTrigger asChild>
                <Button value="add-leave-plan-request" my={4}>
                    <FaPlus fontSize="16px" />
                    Add Leave Plan Request
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add Leave Plan Request</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>
                            Fill in the form below to create a new leave plan request.
                        </Text>
                        <VStack gap={4}>
                            <Field
                                required
                                invalid={!!errors.description}
                                errorText={errors.description?.message}
                                label="Description"
                            >
                                <Textarea
                                    {...register("description", {
                                        required: "Description is required",
                                    })}
                                    placeholder="Reason for leave request"
                                    rows={3}
                                />
                            </Field>

                            <Field
                                required
                                invalid={!!errors.leave_type_id}
                                errorText={errors.leave_type_id?.message}
                                label="Leave Type"
                            >
                                <Select
                                    {...register("leave_type_id", {
                                        required: "Leave Type is required",
                                    })}
                                    options={leaveTypeOptions}
                                    placeholder="Select a leave type..."
                                />
                            </Field>

                            <Field
                                invalid={leaveDates.length === 0 && isSubmitting}
                                errorText={leaveDates.length === 0 && isSubmitting ? "At least one leave date is required" : undefined}
                                label="Leave Dates *"
                            >
                                <VStack gap={3} align="stretch">
                                    {/* Loading indicator for recommendations */}
                                    {isLoadingRecommendations && !hasPopulatedDates && (
                                        <Flex align="center" gap={2} p={2}>
                                            <Spinner size="sm" />
                                            <Text fontSize="sm" color="gray.600">
                                                Loading recommended dates...
                                            </Text>
                                        </Flex>
                                    )}

                                    {/* Input for adding new date */}
                                    <Flex gap={2} align="center">
                                        <Input
                                            value={newDate}
                                            onChange={(e) => setNewDate(e.target.value)}
                                            type="date"
                                            placeholder="Select date"
                                            flex={1}
                                        />
                                        <Button
                                            size="md"
                                            variant="outline"
                                            onClick={handleAddDate}
                                            disabled={!newDate}
                                        >
                                            <FaPlus fontSize="16px" /> Add Date
                                        </Button>
                                        <Text fontSize="sm" color="gray.600">
                                            ({leaveDates.length})
                                        </Text>
                                    </Flex>

                                    {/* List of added dates */}
                                    {leaveDates.length > 0 && (
                                        <VStack
                                            gap={2}
                                            align="stretch"
                                            maxH="200px"
                                            overflowY="auto"
                                            pr={1}
                                        >
                                            {leaveDates.map((date, idx) => (
                                                <Flex
                                                    key={idx}
                                                    align="center"
                                                    gap={2}
                                                    p={2}
                                                    borderWidth="1px"
                                                    borderRadius="md"
                                                    bg={{ base: "gray.50", _dark: "gray.700" }}
                                                >
                                                    <Text flex={1}>
                                                        {new Date(date).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric"
                                                        })}
                                                    </Text>
                                                    <IconButton
                                                        aria-label="Remove date"
                                                        children={<FaTrash fontSize="16px" />}
                                                        size="sm"
                                                        variant="ghost"
                                                        color="red.500"
                                                        onClick={() => handleRemoveDate(date)}
                                                    />
                                                </Flex>
                                            ))}
                                        </VStack>
                                    )}
                                </VStack>
                            </Field>
                        </VStack>
                    </DialogBody>

                    <DialogFooter gap={2}>
                        <DialogActionTrigger asChild>
                            <Button
                                variant="subtle"
                                colorPalette="gray"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </DialogActionTrigger>
                        <Button
                            variant="solid"
                            type="submit"
                            disabled={!isValid || leaveDates.length === 0}
                            loading={isSubmitting}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </form>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}

export default AddLeavePlanRequest
