import {
    Button,
    DialogActionTrigger,
    DialogRoot,
    DialogTrigger,
    Flex,
    Input,
    Text,
    VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"
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
    DialogTitle,
} from "../ui/dialog"
import { Field } from "../ui/field"

// These types will be auto-generated once you regenerate the API client
interface PolicyPublic {
    code: string
    name: string
    operation: string
    value: string
    score: number
    description: string
    is_active: boolean
    id: string
}

interface PolicyUpdate {
    code?: string
    name?: string
    operation?: string
    value?: string
    score?: number
    description?: string
    is_active?: boolean
}

// Temporary service - will be replaced by auto-generated PoliciesService
const PoliciesService = {
    getPolicy: async ({ id }: { id: string }): Promise<PolicyPublic> => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/policies/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error("Failed to fetch policy")
        return response.json()
    },
    updatePolicy: async ({
        id,
        requestBody,
    }: {
        id: string
        requestBody: PolicyUpdate
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/policies/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to update policy")
        }
        return response.json()
    },
}

interface EditPolicyProps {
    policy: PolicyPublic
}

const EditPolicy = ({ policy }: EditPolicyProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoadingRecord, setIsLoadingRecord] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PolicyUpdate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            code: policy.code,
            name: policy.name,
            operation: policy.operation,
            value: policy.value,
            score: policy.score,
            description: policy.description,
            is_active: policy.is_active,
        },
    })

    // Fetch fresh record when dialog opens
    const fetchRecord = async () => {
        setIsLoadingRecord(true)
        try {
            const freshRecord = await PoliciesService.getPolicy({ id: policy.id })
            reset({
                code: freshRecord.code,
                name: freshRecord.name,
                operation: freshRecord.operation,
                value: freshRecord.value,
                score: freshRecord.score,
                description: freshRecord.description,
                is_active: freshRecord.is_active,
            })
        } catch (error) {
            console.error("Failed to fetch record:", error)
        } finally {
            setIsLoadingRecord(false)
        }
    }

    const mutation = useMutation({
        mutationFn: (data: PolicyUpdate) =>
            PoliciesService.updatePolicy({ id: policy.id, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Policy updated successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["policies"] })
        },
    })

    const onSubmit: SubmitHandler<PolicyUpdate> = async (data) => {
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
                    Edit Policy
                </Button>
            </DialogTrigger>
            <DialogContent>
                {isLoadingRecord ? (
                    <DialogBody>Loading...</DialogBody>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Edit Policy</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                            <Text mb={4}>Update the policy details below.</Text>
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
                                        placeholder="Policy code"
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
                                        placeholder="Policy name"
                                        type="text"
                                    />
                                </Field>

                                <Field
                                    required
                                    invalid={!!errors.operation}
                                    errorText={errors.operation?.message}
                                    label="Operation"
                                >
                                    <Input
                                        {...register("operation", {
                                            required: "Operation is required",
                                        })}
                                        placeholder="Operation (e.g., ==, >, <)"
                                        type="text"
                                    />
                                </Field>

                                <Field
                                    required
                                    invalid={!!errors.value}
                                    errorText={errors.value?.message}
                                    label="Value"
                                >
                                    <Input
                                        {...register("value", {
                                            required: "Value is required",
                                        })}
                                        placeholder="Policy value"
                                        type="text"
                                    />
                                </Field>

                                <Field
                                    invalid={!!errors.score}
                                    errorText={errors.score?.message}
                                    label="Score"
                                >
                                    <Input
                                        {...register("score", {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="Score (e.g., 0)"
                                        type="number"
                                    />
                                </Field>

                                <Field
                                    invalid={!!errors.description}
                                    errorText={errors.description?.message}
                                    label="Description"
                                >
                                    <Input
                                        {...register("description")}
                                        placeholder="Description (optional)"
                                        type="text"
                                    />
                                </Field>
                            </VStack>

                            <Flex mt={4} direction="column" gap={4}>
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

export default EditPolicy
