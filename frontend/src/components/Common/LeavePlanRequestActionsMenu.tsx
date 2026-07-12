import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import ApproveLeavePlanRequest from "../LeavePlanRequest/ApproveLeavePlanRequest"
import DeleteLeavePlanRequest from "../LeavePlanRequest/DeleteLeavePlanRequest"
import EditLeavePlanRequest from "../LeavePlanRequest/EditLeavePlanRequest"
import RejectLeavePlanRequest from "../LeavePlanRequest/RejectLeavePlanRequest"
import SubmitLeavePlanRequest from "../LeavePlanRequest/SubmitLeavePlanRequest"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

// Nested user object returned by API
interface UserInfo {
    id: string
    full_name: string
    email: string
}

// Nested leave type object returned by API
interface LeaveTypeInfo {
    id: string
    name: string
}

interface LeavePlanRequestPublic {
    id: string
    description: string
    leave_type_id: string
    owner_id: string
    approver_id: string | null
    requested_at: string
    submitted_at: string | null
    approved_at: string | null
    status: string
    details: Array<{ leave_date: string }>
    owner: UserInfo
    leave_type: LeaveTypeInfo
    approver: UserInfo | null
}

interface LeavePlanRequestActionsMenuProps {
    leavePlanRequest: LeavePlanRequestPublic
    disabled?: boolean
}

export const LeavePlanRequestActionsMenu = ({
    leavePlanRequest,
    disabled,
}: LeavePlanRequestActionsMenuProps) => {
    const status = leavePlanRequest.status?.toLowerCase() || ""
    const isDraft = status === "draft"
    const isPending = status === "pending"
    const isApproved = status === "approved"
    const isRejected = status === "rejected"
    const canDelete = isDraft || isApproved || isRejected

    return (
        <MenuRoot>
            <MenuTrigger asChild>
                <IconButton variant="ghost" color="inherit" disabled={disabled}>
                    <BsThreeDotsVertical />
                </IconButton>
            </MenuTrigger>
            <MenuContent>
                {/* Submit: only available when status is "draft" */}
                {isDraft && <SubmitLeavePlanRequest id={leavePlanRequest.id} />}
                {/* Approve/Reject: only available when status is "pending" */}
                {isPending && <ApproveLeavePlanRequest id={leavePlanRequest.id} />}
                {isPending && <RejectLeavePlanRequest id={leavePlanRequest.id} />}
                {/* Edit: only available for draft */}
                {isDraft && <EditLeavePlanRequest leavePlanRequest={leavePlanRequest} />}
                {/* Delete: available for draft, approved, or rejected */}
                {canDelete && <DeleteLeavePlanRequest id={leavePlanRequest.id} />}
            </MenuContent>
        </MenuRoot>
    )
}
