import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import type { LeaveTypePublic } from "@/client/LeaveTypesService"
import DeleteLeaveType from "../LeaveType/DeleteLeaveType"
import EditLeaveType from "../LeaveType/EditLeaveType"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

interface LeaveTypeActionsMenuProps {
    leaveType: LeaveTypePublic
    disabled?: boolean
}

export const LeaveTypeActionsMenu = ({ leaveType, disabled }: LeaveTypeActionsMenuProps) => {
    return (
        <MenuRoot>
            <MenuTrigger asChild>
                <IconButton variant="ghost" color="inherit" disabled={disabled}>
                    <BsThreeDotsVertical />
                </IconButton>
            </MenuTrigger>
            <MenuContent>
                <EditLeaveType leaveType={leaveType} />
                <DeleteLeaveType id={leaveType.id} />
            </MenuContent>
        </MenuRoot>
    )
}
