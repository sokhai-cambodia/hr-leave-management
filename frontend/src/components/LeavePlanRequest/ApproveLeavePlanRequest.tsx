import { Button, DialogActionTrigger, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FiCheck } from "react-icons/fi"
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
    approveLeavePlanRequest: async ({ id }: { id: string }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(
            `${baseUrl}/api/v1/leave-plan-requests/${id}/approve`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        if (!response.ok) {
            throw new Error("Failed to approve leave plan request")
        }
        return response.json()
    },
}

const ApproveLeavePlanRequest = ({ id }: { id: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const {
        handleSubmit,
        formState: { isSubmitting },
    } = useForm()

    const mutation = useMutation({
        mutationFn: () =>
            LeavePlanRequestsService.approveLeavePlanRequest({ id }),
        onSuccess: () => {
            showSuccessToast("The leave plan request was approved successfully")
            setIsOpen(false)
        },
        onError: () => {
            showErrorToast("An error occurred while approving the leave plan request")
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
                <Button variant="ghost" size="sm" colorPalette="green">
                    <FiCheck fontSize="16px" />
                    Approve
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(() => mutation.mutate())}>
                    <DialogHeader>
                        <DialogTitle>Approve Leave Plan Request</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text>
                            Are you sure you want to approve this leave plan request?
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
                            colorPalette="green"
                            type="submit"
                            loading={isSubmitting}
                        >
                            Approve
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </DialogRoot>
    )
}

export default ApproveLeavePlanRequest
