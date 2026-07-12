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
import { useState } from "react"
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

// These types will be auto-generated once you regenerate the API client
// For now, defining them manually based on the API documentation
interface PublicHolidayCreate {
    name: string
    date: string
    description: string
}

// Temporary service - will be replaced by auto-generated PublicHolidaysService
const PublicHolidaysService = {
    createPublicHoliday: async ({ requestBody }: { requestBody: PublicHolidayCreate }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/public-holidays/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error("Failed to create public holiday")
        }
        return response.json()
    },
}

const AddPublicHoliday = () => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<PublicHolidayCreate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            name: "",
            date: "",
            description: "",
        },
    })

    const mutation = useMutation({
        mutationFn: (data: PublicHolidayCreate) =>
            PublicHolidaysService.createPublicHoliday({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Public holiday created successfully.")
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

    const onSubmit: SubmitHandler<PublicHolidayCreate> = (data) => {
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
                <Button value="add-public-holiday" my={4}>
                    <FaPlus fontSize="16px" />
                    Add Public Holiday
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add Public Holiday</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>
                            Fill in the form below to add a new public holiday to the system.
                        </Text>
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

export default AddPublicHoliday
