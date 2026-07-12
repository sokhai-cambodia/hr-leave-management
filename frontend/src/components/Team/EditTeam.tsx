import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TeamsService, TeamUpdate, TeamPublic } from "@/client/TeamsService"
import useCustomToast from "@/hooks/useCustomToast"
import { useUsers } from "@/hooks/useUsers"
import { handleError } from "@/utils"
import { Button, Flex, Input, VStack } from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"
import { DialogActionTrigger, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const EditTeam = ({ team }: { team: TeamPublic }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoadingRecord, setIsLoadingRecord] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const { data: users = [], isLoading: isLoadingUsers } = useUsers()

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<TeamUpdate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            name: team.name,
            description: team.description,
            team_owner_id: team.team_owner_id,
            is_active: team.is_active,
        },
    })

    // Fetch fresh record when dialog opens
    const fetchRecord = async () => {
        setIsLoadingRecord(true)
        try {
            const freshRecord = await TeamsService.getTeam({ id: team.id })
            reset({
                name: freshRecord.name,
                description: freshRecord.description,
                team_owner_id: freshRecord.team_owner_id,
                is_active: freshRecord.is_active,
            })
        } catch (error) {
            console.error("Failed to fetch record:", error)
        } finally {
            setIsLoadingRecord(false)
        }
    }

    const mutation = useMutation({
        mutationFn: (data: TeamUpdate) => TeamsService.updateTeam({ id: team.id, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Team updated successfully.")
            setIsOpen(false) // Close first
            setTimeout(() => {
                reset() // Reset after a delay
            }, 100)
        },
        onError: (err: any) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["teams"] })
        },
    })

    const onSubmit: SubmitHandler<TeamUpdate> = (data) => {
        // Prevent multiple submissions
        if (isSubmitting) return
        mutation.mutate(data)
    }

    // Reset form when dialog opens
    const handleOpenChange = async ({ open }: { open: boolean }) => {
        if (open && !isOpen) {
            // Only set to open if it wasn't already open
            setIsOpen(true)
            // Fetch fresh record from server
            await fetchRecord()
        } else if (!open && isOpen) {
            // Only set to close if it was open
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
                <Button variant="ghost" size="sm" colorPalette="teal">
                    <FaExchangeAlt fontSize="16px" />
                    Edit Team
                </Button>
            </DialogTrigger>
            <DialogContent>
                {isLoadingRecord ? (
                    <DialogBody>Loading...</DialogBody>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Edit Team</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                            <VStack gap={4}>
                                <Field required invalid={!!errors.name} errorText={errors.name?.message} label="Name">
                                    <Input {...register("name", { required: "Name is required" })} placeholder="Enter team name" type="text" />
                                </Field>
                                <Field required invalid={!!errors.description} errorText={errors.description?.message} label="Description">
                                    <Input {...register("description", { required: "Description is required" })} placeholder="Enter description" type="text" />
                                </Field>
                                <Field required invalid={!!errors.team_owner_id} errorText={errors.team_owner_id?.message} label="Team Owner">
                                    <Controller
                                        control={control}
                                        name="team_owner_id"
                                        rules={{ required: "Team owner is required" }}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                placeholder="Select team owner..."
                                                options={users.map(user => ({
                                                    value: user.id,
                                                    label: user.name
                                                }))}
                                                disabled={isLoadingUsers || isSubmitting}
                                            />
                                        )}
                                    />
                                </Field>
                            </VStack>
                            <Flex mt={4} direction="column" gap={4}>
                                <Controller
                                    control={control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <Field disabled={field.disabled} colorPalette="teal">
                                            <Checkbox checked={field.value} onCheckedChange={({ checked }) => field.onChange(checked === true)}>
                                                Is active?
                                            </Checkbox>
                                        </Field>
                                    )}
                                />
                            </Flex>
                        </DialogBody>
                        <DialogFooter gap={2}>
                            <DialogActionTrigger asChild>
                                <Button variant="subtle" colorPalette="gray" disabled={isSubmitting}>Cancel</Button>
                            </DialogActionTrigger>
                            <Button variant="solid" type="submit" disabled={!isValid} loading={isSubmitting}>Save</Button>
                        </DialogFooter>
                    </form>
                )}
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}
export default EditTeam;
