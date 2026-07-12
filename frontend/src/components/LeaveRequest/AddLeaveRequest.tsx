import {
    Button,
    DialogActionTrigger,
    DialogTitle,
    Input,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"
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
    DialogRoot,
    DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"
import { Select } from "../ui/select"
import LeaveTypesService from "@/client/LeaveTypesService"

interface LeaveRequestCreate {
    start_date: string
    end_date: string
    description: string
    leave_type_id: string
}

// Temporary service - replace with auto-generated client when available
const LeaveRequestsService = {
    createLeaveRequest: async ({
        requestBody,
    }: {
        requestBody: LeaveRequestCreate
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}))
            const error = new Error("Failed to create leave request") as any
            error.body = errorBody
            throw error
        }
        return response.json()
    },
}

const AddLeaveRequest = () => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid, isSubmitting },
    } = useForm<LeaveRequestCreate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            start_date: "",
            end_date: "",
            description: "",
            leave_type_id: "",
        },
    })

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
        mutationFn: (data: LeaveRequestCreate) =>
            LeaveRequestsService.createLeaveRequest({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Leave request created successfully.")
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

    const onSubmit: SubmitHandler<LeaveRequestCreate> = (data) => {
        mutation.mutate(data)
    }

    const start = watch("start_date")
    const end = watch("end_date")
    const dateRangeInvalid = Boolean(start && end && start > end)

    return (
        <DialogRoot
            size={{ base: "xs", md: "md" }}
            placement="center"
            open={isOpen}
            onOpenChange={({ open }) => {
                setIsOpen(open)
                if (!open) {
                    reset()
                }
            }}
        >
            <DialogTrigger asChild>
                <Button value="add-leave-request" my={4}>
                    <FaPlus fontSize="16px" />
                    Add Leave Request
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add Leave Request</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>Fill in the form below to create a new leave request.</Text>
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
                        <Button
                            variant="solid"
                            type="submit"
                            disabled={!isValid || dateRangeInvalid}
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

export default AddLeaveRequest
