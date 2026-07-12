import { Button, Input, Text, VStack } from "@chakra-ui/react"
import { useEffect } from "react"
import LeaveTypesService from "@/client/LeaveTypesService"
import { useUsers } from "@/hooks/useUsers"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
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
    DialogRoot,
    DialogTrigger,
    DialogActionTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"
import { Select } from "../ui/select"

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

interface LeaveBalanceUpdate {
    year?: string
    balance?: number
    leave_type_id?: string
    owner_id?: string
}

// Temporary service - will be replaced by auto-generated LeaveBalancesService
const LeaveBalancesService = {
    getLeaveBalance: async ({ id }: { id: string }): Promise<LeaveBalancePublic> => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-balances/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error("Failed to fetch leave balance")
        return response.json()
    },
    updateLeaveBalance: async ({
        id,
        requestBody,
    }: {
        id: string
        requestBody: LeaveBalanceUpdate
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-balances/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to update leave balance")
        }
        return response.json()
    },
}

interface EditLeaveBalanceProps {
    leaveBalance: LeaveBalancePublic
}

const EditLeaveBalance = ({ leaveBalance }: EditLeaveBalanceProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoadingRecord, setIsLoadingRecord] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LeaveBalanceUpdate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            year: leaveBalance.year,
            balance: leaveBalance.balance,
            leave_type_id: leaveBalance.leave_type_id,
            owner_id: leaveBalance.owner_id,
        },
    })

    // Fetch fresh record when dialog opens
    const fetchRecord = async () => {
        setIsLoadingRecord(true)
        try {
            const freshRecord = await LeaveBalancesService.getLeaveBalance({ id: leaveBalance.id })
            reset({
                year: freshRecord.year,
                balance: freshRecord.balance,
                leave_type_id: freshRecord.leave_type_id,
                owner_id: freshRecord.owner_id,
            })
        } catch (error) {
            console.error("Failed to fetch record:", error)
        } finally {
            setIsLoadingRecord(false)
        }
    }

    // Fetch leave types
    const [leaveTypes, setLeaveTypes] = useState<import("@/client/LeaveTypesService").LeaveTypePublic[]>([])
    const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(true)
    useEffect(() => {
        LeaveTypesService.readLeaveTypes({ limit: 100 }).then((res) => {
            setLeaveTypes(res.data)
            setLoadingLeaveTypes(false)
        })
    }, [])

    // Fetch users
    const { data: users = [], isLoading: loadingUsers } = useUsers()

    const mutation = useMutation({
        mutationFn: (data: LeaveBalanceUpdate) =>
            LeaveBalancesService.updateLeaveBalance({ id: leaveBalance.id, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Leave balance updated successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-balances"] })
        },
    })

    const onSubmit: SubmitHandler<LeaveBalanceUpdate> = async (data) => {
        mutation.mutate(data)
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
                    Edit Leave Balance
                </Button>
            </DialogTrigger>
            <DialogContent>
                {isLoadingRecord ? (
                    <DialogBody>Loading...</DialogBody>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Edit Leave Balance</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                            <Text mb={4}>Update the leave balance details below.</Text>
                            <VStack gap={4}>
                                <Field
                                    required
                                    invalid={!!errors.year}
                                    errorText={errors.year?.message}
                                    label="Year"
                                >
                                    <Input
                                        {...register("year", {
                                            required: "Year is required",
                                        })}
                                        placeholder="2025"
                                        type="text"
                                    />
                                </Field>

                                <Field
                                    required
                                    invalid={!!errors.balance}
                                    errorText={errors.balance?.message}
                                    label="Balance"
                                >
                                    <Input
                                        {...register("balance", {
                                            required: "Balance is required",
                                            valueAsNumber: true,
                                        })}
                                        placeholder="15"
                                        type="number"
                                        step="0.5"
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
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setValue("leave_type_id", e.target.value, { shouldValidate: true })}
                                        options={leaveTypes.map((type) => ({
                                            value: type.id,
                                            label: type.name,
                                        }))}
                                    />
                                </Field>

                                <Field
                                    required
                                    invalid={!!errors.owner_id}
                                    errorText={errors.owner_id?.message}
                                    label="Owner"
                                >
                                    <Select
                                        placeholder={loadingUsers ? "Loading..." : "Select user"}
                                        {...register("owner_id", {
                                            required: "Owner is required",
                                        })}
                                        disabled={loadingUsers}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setValue("owner_id", e.target.value, { shouldValidate: true })}
                                        options={users.map((user) => ({
                                            value: user.id,
                                            label: user.name,
                                        }))}
                                    />
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
                            <Button variant="solid" type="submit" loading={isSubmitting}>
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

export default EditLeaveBalance
