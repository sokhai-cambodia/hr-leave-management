import {
    Button,
    DialogActionTrigger,
    DialogTitle,
    Flex,
    Input,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"
import type { ApiError } from "@/client/core/ApiError"
import { OpenAPI } from "@/client/core/OpenAPI"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { Checkbox } from "../ui/checkbox"
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

interface LeaveTypeCreate {
    code: string
    name: string
    entitlement: number
    description: string
    is_allow_plan: boolean
    is_active: boolean
}

const LeaveTypesService = {
    createLeaveType: async ({ requestBody }: { requestBody: LeaveTypeCreate }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-types`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to create leave type")
        }
        return response.json()
    },
}

const AddLeaveType = () => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<LeaveTypeCreate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            code: "",
            name: "",
            entitlement: 0,
            description: "",
            is_allow_plan: true,
            is_active: true,
        },
    })

    const mutation = useMutation({
        mutationFn: (data: LeaveTypeCreate) =>
            LeaveTypesService.createLeaveType({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Leave type created successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-types"] })
        },
    })

    const onSubmit: SubmitHandler<LeaveTypeCreate> = (data) => {
        mutation.mutate(data)
    }

    return (
        <DialogRoot
            size={{ base: "xs", md: "md" }}
            placement="center"
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}
        >
            <DialogTrigger asChild>
                <Button value="add-leave-type" my={4}>
                    <FaPlus fontSize="16px" />
                    Add Leave Type
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add Leave Type</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>
                            Fill in the form below to add a new leave type to the system.
                        </Text>
                        <VStack gap={4}>
                            <Field
                                required
                                invalid={!!errors.code}
                                errorText={errors.code?.message}
                                label="Code"
                            >
                                <Input
                                    {...register("code", {
                                        required: "Code is required",
                                    })}
                                    placeholder="Leave type code"
                                    type="text"
                                />
                            </Field>

                            <Field
                                required
                                invalid={!!errors.name}
                                errorText={errors.name?.message}
                                label="Name"
                            >
                                <Input
                                    {...register("name", {
                                        required: "Name is required",
                                    })}
                                    placeholder="Leave type name"
                                    type="text"
                                />
                            </Field>

                            <Field
                                required
                                invalid={!!errors.entitlement}
                                errorText={errors.entitlement?.message}
                                label="Entitlement (days)"
                            >
                                <Input
                                    {...register("entitlement", {
                                        required: "Entitlement is required",
                                        valueAsNumber: true,
                                        min: {
                                            value: 0,
                                            message: "Entitlement must be 0 or greater",
                                        },
                                    })}
                                    placeholder="Number of days"
                                    type="number"
                                />
                            </Field>

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
                                    placeholder="Leave type description"
                                    rows={4}
                                />
                            </Field>
                        </VStack>

                        <Flex mt={4} direction="column" gap={4}>
                            <Controller
                                control={control}
                                name="is_allow_plan"
                                render={({ field }) => (
                                    <Field disabled={field.disabled} colorPalette="teal">
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={({ checked }) => field.onChange(checked === true)}
                                        >
                                            Allow planning?
                                        </Checkbox>
                                    </Field>
                                )}
                            />
                            <Controller
                                control={control}
                                name="is_active"
                                render={({ field }) => (
                                    <Field disabled={field.disabled} colorPalette="teal">
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={({ checked }) => field.onChange(checked === true)}
                                        >
                                            Is active?
                                        </Checkbox>
                                    </Field>
                                )}
                            />
                        </Flex>
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
                            disabled={!isValid}
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

export default AddLeaveType
