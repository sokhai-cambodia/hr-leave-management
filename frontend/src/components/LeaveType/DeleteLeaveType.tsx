import { Button, DialogTitle, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FiTrash2 } from "react-icons/fi"
import { OpenAPI } from "@/client/core/OpenAPI"
import {
    DialogActionTrigger,
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTrigger,
} from "../ui/dialog"
import useCustomToast from "@/hooks/useCustomToast"

const LeaveTypesService = {
    deleteLeaveType: async ({ leaveTypeId }: { leaveTypeId: string }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-types/${leaveTypeId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error("Failed to delete leave type")
        }
        return response.json()
    },
}

const DeleteLeaveType = ({ id }: { id: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const {
        handleSubmit,
        formState: { isSubmitting },
    } = useForm()

    const deleteLeaveType = async (id: string) => {
        await LeaveTypesService.deleteLeaveType({ leaveTypeId: id })
    }

    const mutation = useMutation({
        mutationFn: deleteLeaveType,
        onSuccess: () => {
            showSuccessToast("The leave type was deleted successfully")
            setIsOpen(false)
        },
        onError: () => {
            showErrorToast("An error occurred while deleting the leave type")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-types"] })
        },
    })

    const onSubmit = async () => {
        mutation.mutate(id)
    }

    return (
        <DialogRoot
            size={{ base: "xs", md: "md" }}
            placement="center"
            role="alertdialog"
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}
        >
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" colorPalette="red">
                    <FiTrash2 fontSize="16px" />
                    Delete Leave Type
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Delete Leave Type</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>
                            This leave type will be <strong>permanently deleted.</strong> Are you
                            sure? You will not be able to undo this action.
                        </Text>
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
                            colorPalette="red"
                            type="submit"
                            loading={isSubmitting}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                    <DialogCloseTrigger />
                </form>
            </DialogContent>
        </DialogRoot>
    )
}

export default DeleteLeaveType
