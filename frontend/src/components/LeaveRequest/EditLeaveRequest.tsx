import {
    Button,
    DialogActionTrigger,
    DialogRoot,
    DialogTrigger,
    Input,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"
import type { ApiError } from "@/client/core/ApiError"
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
import LeaveTypesService from "@/client/LeaveTypesService"

interface LeaveTypeInfo {
    id: string
    code: string
    name: string
}

interface OwnerInfo {
    id: string
    full_name: string
    email: string
}

interface ApproverInfo {
    id: string
    full_name: string
    email: string
}

interface LeaveRequestPublic {
    id: string
    start_date: string
    end_date: string
    description: string
    leave_type_id: string
    owner_id: string
    approver_id: string | null
    amount: number
    requested_at: string
    submitted_at: string | null
    approval_at: string | null
    status: string
    owner: OwnerInfo
    leave_type: LeaveTypeInfo
    approver: ApproverInfo | null
}

interface LeaveRequestUpdate {
    start_date?: string
    end_date?: string
    description?: string
    leave_type_id?: string
}

// Temporary service - replace with auto-generated client when available
const LeaveRequestsService = {
    getLeaveRequest: async ({ id }: { id: string }): Promise<LeaveRequestPublic> => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-requests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error("Failed to fetch leave request")
        return response.json()
    },
    updateLeaveRequest: async ({
        id,
        requestBody,
    }: {
        id: string
        requestBody: LeaveRequestUpdate
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-requests/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to update leave request")
        }
        return response.json()
    },
}

interface EditLeaveRequestProps {
    leaveRequest: LeaveRequestPublic
}

const EditLeaveRequest = ({ leaveRequest }: EditLeaveRequestProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoadingRecord, setIsLoadingRecord] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<LeaveRequestUpdate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            description: leaveRequest.description,
            start_date: leaveRequest.start_date?.slice(0, 10),
            end_date: leaveRequest.end_date?.slice(0, 10),
            leave_type_id: leaveRequest.leave_type_id,
        },
    })

    // Fetch fresh record when dialog opens
    const fetchRecord = async () => {
        setIsLoadingRecord(true)
        try {
            const freshRecord = await LeaveRequestsService.getLeaveRequest({ id: leaveRequest.id })
            reset({
                description: freshRecord.description,
                start_date: freshRecord.start_date?.slice(0, 10),
                end_date: freshRecord.end_date?.slice(0, 10),
                leave_type_id: freshRecord.leave_type_id,
            })
        } catch (error) {
            console.error("Failed to fetch record:", error)
        } finally {
            setIsLoadingRecord(false)
        }
    }

    // Fetch leave types for dropdown - only when dialog is open
    const [leaveTypes, setLeaveTypes] = useState<import("@/client/LeaveTypesService").LeaveTypePublic[]>([])
    const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false)
    useEffect(() => {
        if (!isOpen) return
        let active = true
        setLoadingLeaveTypes(true)
        LeaveTypesService.readLeaveTypes({ limit: 100 })
            .then((res) => {
                if (!active) return
                setLeaveTypes(res.data)
            })
            .finally(() => {
                if (!active) return
                setLoadingLeaveTypes(false)
            })
        return () => {
            active = false
        }
    }, [isOpen])

    const mutation = useMutation({
        mutationFn: (data: LeaveRequestUpdate) =>
            LeaveRequestsService.updateLeaveRequest({
                id: leaveRequest.id,
                requestBody: data,
            }),
        onSuccess: () => {
            showSuccessToast("Leave request updated successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
        },
    })

    const onSubmit: SubmitHandler<LeaveRequestUpdate> = async (data) => {
        mutation.mutate(data)
    }

    const start = watch("start_date") as string | undefined
    const end = watch("end_date") as string | undefined
    const dateRangeInvalid = Boolean(start && end && start > end)

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
                            <DialogTitle>Edit Leave Request</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                            <Text mb={4}>Update the leave request details below.</Text>
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
                                        placeholder="Reason for leave"
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
                                        placeholder={loadingLeaveTypes ? "Loading..." : "Select leave type"}
                                        {...register("leave_type_id", {
                                            required: "Leave Type is required",
                                        })}
                                        disabled={loadingLeaveTypes}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                            setValue("leave_type_id", e.target.value, { shouldValidate: true })
                                        }
                                        options={leaveTypes.map((t) => ({ value: t.id, label: t.name }))}
                                    />
                                </Field>

                                <Field
                                    required
                                    invalid={!!errors.start_date}
                                    errorText={errors.start_date?.message}
                                    label="Start Date"
                                >
                                    <Input
                                        {...register("start_date", {
                                            required: "Start date is required",
                                        })}
                                        type="date"
                                    />
                                </Field>

                                <Field
                                    required
                                    invalid={!!errors.end_date || dateRangeInvalid}
                                    errorText={
                                        dateRangeInvalid
                                            ? "End date must be on or after start date"
                                            : errors.end_date?.message
                                    }
                                    label="End Date"
                                >
                                    <Input
                                        {...register("end_date", {
                                            required: "End date is required",
                                        })}
                                        type="date"
                                    />
                                </Field>
                            </VStack>
                        </DialogBody>

                        <DialogFooter gap={2}>
                            <DialogActionTrigger asChild>
                                <Button variant="subtle" colorPalette="gray" disabled={isSubmitting}>
                                    Cancel
                                </Button>
                            </DialogActionTrigger>
                            <Button variant="solid" type="submit" loading={isSubmitting} disabled={dateRangeInvalid}>
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

export default EditLeaveRequest
