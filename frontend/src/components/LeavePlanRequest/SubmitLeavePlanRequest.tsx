import { Button } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FiSend } from "react-icons/fi"
import { OpenAPI } from "@/client/core/OpenAPI"
import useCustomToast from "@/hooks/useCustomToast"

// Temporary service - will be replaced by auto-generated LeavePlanRequestsService
const LeavePlanRequestsService = {
    submitLeavePlanRequest: async ({ id }: { id: string }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(
            `${baseUrl}/api/v1/leave-plan-requests/${id}/submit`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        if (!response.ok) {
            throw new Error("Failed to submit leave plan request")
        }
        return response.json()
    },
}

const SubmitLeavePlanRequest = ({ id }: { id: string }) => {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const mutation = useMutation({
        mutationFn: () =>
            LeavePlanRequestsService.submitLeavePlanRequest({ id }),
        onSuccess: () => {
            showSuccessToast("The leave plan request was submitted successfully")
        },
        onError: () => {
            showErrorToast("An error occurred while submitting the leave plan request")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-plan-requests"] })
        },
    })

    return (
        <Button
            variant="ghost"
            size="sm"
            colorPalette="blue"
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
        >
            <FiSend fontSize="16px" />
            Submit
        </Button>
    )
}

export default SubmitLeavePlanRequest
