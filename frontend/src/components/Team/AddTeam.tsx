import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TeamsService, TeamCreate } from "@/client/TeamsService"
import { useUsers } from "@/hooks/useUsers"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { Button, Flex, Input, VStack } from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"
import { DialogActionTrigger, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const AddTeam = () => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const { data: users = [], isLoading: isLoadingUsers } = useUsers()

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<TeamCreate>({
        mode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            name: "",
            description: "",
            team_owner_id: "",
            is_active: true,
        },
    })
    const mutation = useMutation({
        mutationFn: (data: TeamCreate) => TeamsService.createTeam({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Team created successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: any) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["teams"] })
        },
    })
    const onSubmit: SubmitHandler<TeamCreate> = (data) => {
        mutation.mutate(data)
    }
    return (
        <DialogRoot size={{ base: "xs", md: "md" }} placement="center" open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
            <DialogTrigger asChild>
                <Button value="add-team" my={4}>
                    <FaPlus fontSize="16px" />
                    Add Team
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add Team</DialogTitle>
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
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}
export default AddTeam;
