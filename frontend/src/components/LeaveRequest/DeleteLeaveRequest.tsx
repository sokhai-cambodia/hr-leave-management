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

// Temporary service - replace with auto-generated client when available
const LeaveRequestsService = {
    deleteLeaveRequest: async ({ leaveRequestId }: { leaveRequestId: string }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-requests/${leaveRequestId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error("Failed to delete leave request")
        }
        return response.json()
    },
}

const DeleteLeaveRequest = ({ id }: { id: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const { handleSubmit, formState: { isSubmitting } } = useForm()

    const mutation = useMutation({
        mutationFn: () => LeaveRequestsService.deleteLeaveRequest({ leaveRequestId: id }),
        onSuccess: () => {
            showSuccessToast("The leave request was deleted successfully")
            setIsOpen(false)
        },
        onError: () => {
            showErrorToast("An error occurred while deleting the leave request")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
        },
    })

    return (
        <DialogRoot role="alertdialog" open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" colorPalette="red">
                    <FiTrash2 fontSize="16px" />
                    Delete Request
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(() => mutation.mutate())}>
                    <DialogHeader>
                        <DialogTitle>Delete Leave Request</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text>
                            This leave request will be <strong>permanently deleted.</strong> Are you sure?
                        </Text>
                    </DialogBody>
                    <DialogFooter gap={2}>
                        <DialogActionTrigger asChild>
                            <Button variant="subtle" colorPalette="gray" disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </DialogActionTrigger>
                        <Button variant="solid" colorPalette="red" type="submit" loading={isSubmitting}>
                            Delete
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </DialogRoot>
    )
}

export default DeleteLeaveRequest
