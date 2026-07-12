import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import DeletePublicHoliday from "../PublicHoliday/DeletePublicHoliday"
import EditPublicHoliday from "../PublicHoliday/EditPublicHoliday"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

// This type will be auto-generated once you regenerate the API client
interface PublicHolidayPublic {
    name: string
    date: string
    description: string
    id: string
}

interface PublicHolidayActionsMenuProps {
    publicHoliday: PublicHolidayPublic
    disabled?: boolean
}

export const PublicHolidayActionsMenu = ({
    publicHoliday,
    disabled,
}: PublicHolidayActionsMenuProps) => {
    return (
        <MenuRoot>
            <MenuTrigger asChild>
                <IconButton variant="ghost" color="inherit" disabled={disabled}>
                    <BsThreeDotsVertical />
                </IconButton>
            </MenuTrigger>
            <MenuContent>
                <EditPublicHoliday publicHoliday={publicHoliday} />
                <DeletePublicHoliday id={publicHoliday.id} />
            </MenuContent>
        </MenuRoot>
    )
}
