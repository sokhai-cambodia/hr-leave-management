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
} from "../ui/dialog"
import { Field } from "../ui/field"

// These types will be auto-generated once you regenerate the API client
interface PublicHolidayPublic {
    name: string
    date: string
    description: string
    id: string
}

interface PublicHolidayUpdate {
    name?: string
    date?: string
    description?: string
}

// Temporary service - will be replaced by auto-generated PublicHolidaysService
const PublicHolidaysService = {
    getPublicHoliday: async ({ id }: { id: string }): Promise<PublicHolidayPublic> => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/public-holidays/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error("Failed to fetch public holiday")
        return response.json()
    },
    updatePublicHoliday: async ({
        id,
        requestBody,
    }: {
        id: string
        requestBody: PublicHolidayUpdate
    }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/public-holidays/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to update public holiday")
        }
        return response.json()
    },
}

interface EditPublicHolidayProps {
    publicHoliday: PublicHolidayPublic
}

const EditPublicHoliday = ({ publicHoliday }: EditPublicHolidayProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoadingRecord, setIsLoadingRecord] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PublicHolidayUpdate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            name: publicHoliday.name,
            date: publicHoliday.date,
            description: publicHoliday.description,
        },
    })

    // Fetch fresh record when dialog opens
    const fetchRecord = async () => {
        setIsLoadingRecord(true)
        try {
            const freshRecord = await PublicHolidaysService.getPublicHoliday({ id: publicHoliday.id })
            reset({
                name: freshRecord.name,
                date: freshRecord.date,
                description: freshRecord.description,
            })
        } catch (error) {
            console.error("Failed to fetch record:", error)
        } finally {
            setIsLoadingRecord(false)
        }
    }

    const mutation = useMutation({
        mutationFn: (data: PublicHolidayUpdate) =>
            PublicHolidaysService.updatePublicHoliday({ id: publicHoliday.id, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Public holiday updated successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["public-holidays"] })
        },
    })

    const onSubmit: SubmitHandler<PublicHolidayUpdate> = async (data) => {
        mutation.mutate(data)
    }

    const handleOpenChange = ({ open }: { open: boolean }) => {
        setIsOpen(open)
        if (open) {
            fetchRecord()
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
                    Edit Public Holiday
                </Button>
            </DialogTrigger>
            <DialogContent>
                {isLoadingRecord ? (
                    <DialogBody>Loading...</DialogBody>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Edit Public Holiday</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                            <Text mb={4}>Update the public holiday details below.</Text>
                            <VStack gap={4}>
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
                                        placeholder="Holiday name"
                                        type="text"
                                    />
                                </Field>

                                <Field
                                    required
                                    invalid={!!errors.date}
                                    errorText={errors.date?.message}
                                    label="Date"
                                >
                                    <Input
                                        {...register("date", {
                                            required: "Date is required",
                                        })}
                                        placeholder="YYYY-MM-DD"
                                        type="date"
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
                                        placeholder="Holiday description"
                                        rows={4}
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

export default EditPublicHoliday
