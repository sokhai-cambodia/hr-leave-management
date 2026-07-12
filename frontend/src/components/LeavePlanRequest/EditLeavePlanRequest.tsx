import {
    Button,
    DialogActionTrigger,
    DialogRoot,
    DialogTrigger,
    Input,
    Text,
    Textarea,
    VStack,
    IconButton,
    Flex,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt, FaPlus, FaTrash } from "react-icons/fa"
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
    DialogTitle,
} from "../ui/dialog"
import { Field } from "../ui/field"
import { Select } from "../ui/select"

// Nested user object returned by API
interface UserInfo {
    id: string
    full_name: string
    email: string
}

// Nested leave type object returned by API
interface LeaveTypeInfo {
    id: string
    name: string
}

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
    details: Array<{ leave_date: string }>
    owner: UserInfo
    leave_type: LeaveTypeInfo
    approver: UserInfo | null
}

interface LeavePlanRequestUpdate {
    description?: string
    leave_type_id?: string
    details?: Array<{ leave_date: string }>
}

// Temporary service - will be replaced by auto-generated LeavePlanRequestsService
const LeavePlanRequestsService = {
    getLeavePlanRequest: async ({ id }: { id: string }): Promise<LeavePlanRequestPublic> => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-plan-requests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error("Failed to fetch leave plan request")
        return response.json()
    },
    updateLeavePlanRequest: async ({
        id,
        requestBody,
    }: {
        id: string
        requestBody: LeavePlanRequestUpdate
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-plan-requests/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to update leave plan request")
        }
        return response.json()
    },
}

interface EditLeavePlanRequestProps {
    leavePlanRequest: LeavePlanRequestPublic
}

const EditLeavePlanRequest = ({ leavePlanRequest }: EditLeavePlanRequestProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoadingRecord, setIsLoadingRecord] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const [leaveDates, setLeaveDates] = useState<string[]>(
        leavePlanRequest.details?.map(d => d.leave_date) || []
    )
    const [newDate, setNewDate] = useState("")

    // Fetch leave types for dropdown
    const { data: leaveTypesData } = useQuery({
        queryKey: ["leave-types"],
        queryFn: () => LeaveTypesService.readLeaveTypes({ skip: 0, limit: 100 }),
    })

    const leaveTypes = leaveTypesData?.data || []
    const leaveTypeOptions = leaveTypes
        .filter(lt => lt.is_active)
        .map(lt => ({
            value: lt.id,
            label: lt.name,
        }))

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LeavePlanRequestUpdate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            description: leavePlanRequest.description,
            leave_type_id: leavePlanRequest.leave_type_id,
        },
    })

    // Fetch fresh record when dialog opens
    const fetchRecord = async () => {
        setIsLoadingRecord(true)
        try {
            const freshRecord = await LeavePlanRequestsService.getLeavePlanRequest({ id: leavePlanRequest.id })
            reset({
                description: freshRecord.description,
                leave_type_id: freshRecord.leave_type_id,
            })
            setLeaveDates(freshRecord.details?.map(d => d.leave_date) || [])
        } catch (error) {
            console.error("Failed to fetch record:", error)
        } finally {
            setIsLoadingRecord(false)
        }
    }

    const handleAddDate = () => {
        if (newDate && !leaveDates.includes(newDate)) {
            setLeaveDates([...leaveDates, newDate])
            setNewDate("")
        }
    }

    const handleRemoveDate = (dateToRemove: string) => {
        setLeaveDates(leaveDates.filter(date => date !== dateToRemove))
    }

    const mutation = useMutation({
        mutationFn: (data: LeavePlanRequestUpdate) =>
            LeavePlanRequestsService.updateLeavePlanRequest({
                id: leavePlanRequest.id,
                requestBody: data,
            }),
        onSuccess: () => {
            showSuccessToast("Leave plan request updated successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-plan-requests"] })
        },
    })

    const onSubmit: SubmitHandler<LeavePlanRequestUpdate> = async (data) => {
        // Convert leaveDates array to details format
        const details = leaveDates.map(date => ({ leave_date: date }))

        mutation.mutate({
            ...data,
            details,
        })
    }

    const handleOpenChange = async ({ open }: { open: boolean }) => {
        if (open) {
            setIsOpen(true)
            await fetchRecord()
        } else {
            setIsOpen(false)
        }
    }

    return (
        <DialogRoot
            size={{ base: "xs", md: "md" }}
            placement="center"
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <FaExchangeAlt fontSize="16px" />
                    Edit Request
                </Button>
            </DialogTrigger>
            <DialogContent>
                {isLoadingRecord ? (
                    <DialogBody>Loading...</DialogBody>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Edit Leave Plan Request</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                            <Text mb={4}>Update the leave plan request details below.</Text>
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
                                    disabled={leaveDates.length === 0}
                                    loading={isSubmitting}
                                >
                                Save
                            </Button>
                        </DialogFooter>
                        <DialogCloseTrigger />
                    </form>
                )}
            </DialogContent>
        </DialogRoot>
    )
}

export default EditLeavePlanRequest
