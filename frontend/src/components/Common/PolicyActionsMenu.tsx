import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import DeletePolicy from "../Policy/DeletePolicy"
import EditPolicy from "../Policy/EditPolicy"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

// This type will be auto-generated once you regenerate the API client
interface PolicyPublic {
    code: string
    name: string
    operation: string
    value: string
    score: number
    description: string
    is_active: boolean
    id: string
}

interface PolicyActionsMenuProps {
    policy: PolicyPublic
    disabled?: boolean
}

export const PolicyActionsMenu = ({
    policy,
    disabled,
}: PolicyActionsMenuProps) => {
    return (
        <MenuRoot>
            <MenuTrigger asChild>
                <IconButton variant="ghost" color="inherit" disabled={disabled}>
                    <BsThreeDotsVertical />
                </IconButton>
            </MenuTrigger>
            <MenuContent>
                <EditPolicy policy={policy} />
                <DeletePolicy id={policy.id} />
            </MenuContent>
        </MenuRoot>
    )
}
