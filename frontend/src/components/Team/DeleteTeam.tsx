import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TeamsService } from "@/client/TeamsService"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { Button, Text } from "@chakra-ui/react"
// Checkbox not used in this file
import { DialogActionTrigger, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FiTrash2 } from "react-icons/fi"

const DeleteTeam = ({ id }: { id: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const mutation = useMutation({
        mutationFn: () => TeamsService.deleteTeam({ teamId: id }),
        onSuccess: () => {
            showSuccessToast("The team was deleted successfully")
            setIsOpen(false)
        },
        onError: (err: any) => {
            showErrorToast("An error occurred while deleting the team")
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["teams"] })
        },
    })
    return (
        <DialogRoot role="alertdialog" open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" colorPalette="red">
                    <FiTrash2 fontSize="16px" />
                    Delete Team
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
                    <DialogHeader>
                        <DialogTitle>Delete Team</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text>
                            This team will be <strong>permanently deleted.</strong> Are you sure?
                        </Text>
                    </DialogBody>
                    <DialogFooter gap={2}>
                        <DialogActionTrigger asChild>
                            <Button variant="subtle" colorPalette="gray" disabled={mutation.isPending}>Cancel</Button>
                        </DialogActionTrigger>
                        <Button variant="solid" colorPalette="red" type="submit" loading={mutation.isPending}>Delete</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </DialogRoot>
    )
}
export default DeleteTeam;
