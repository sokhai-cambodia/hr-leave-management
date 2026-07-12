import { Button, DialogActionTrigger, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FiTrash2 } from "react-icons/fi"
import { OpenAPI } from "@/client/core/OpenAPI"
import useCustomToast from "@/hooks/useCustomToast"
import {
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"

// Temporary service - will be replaced by auto-generated LeavePlanRequestsService
const LeavePlanRequestsService = {
    deleteLeavePlanRequest: async ({ leavePlanRequestId }: { leavePlanRequestId: string }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(
            `${baseUrl}/api/v1/leave-plan-requests/${leavePlanRequestId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        if (!response.ok) {
            throw new Error("Failed to delete leave plan request")
        }
        return response.json()
    },
}

const DeleteLeavePlanRequest = ({ id }: { id: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const { handleSubmit, formState: { isSubmitting } } = useForm()

    const mutation = useMutation({
        mutationFn: () =>
            LeavePlanRequestsService.deleteLeavePlanRequest({ leavePlanRequestId: id }),
        onSuccess: () => {
            showSuccessToast("The leave plan request was deleted successfully")
            setIsOpen(false)
        },
        onError: () => {
            showErrorToast("An error occurred while deleting the leave plan request")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-plan-requests"] })
        },
    })

    return (
        <DialogRoot
            role="alertdialog"
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}
        >
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" colorPalette="red">
                    <FiTrash2 fontSize="16px" />
                    Delete Request
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(() => mutation.mutate())}>
                    <DialogHeader>
                        <DialogTitle>Delete Leave Plan Request</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text>
                            This leave plan request will be <strong>permanently deleted.</strong>{" "}
                            Are you sure?
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
                </form>
            </DialogContent>
        </DialogRoot>
    )
}

export default DeleteLeavePlanRequest
