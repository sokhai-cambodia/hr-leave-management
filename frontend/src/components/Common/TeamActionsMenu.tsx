import EditTeam from "@/components/Team/EditTeam";
import DeleteTeam from "@/components/Team/DeleteTeam";
import { IconButton } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { TeamPublic } from "@/client/TeamsService";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";

interface TeamActionsMenuProps {
  team: TeamPublic;
  disabled?: boolean;
}

export const TeamActionsMenu = ({ team, disabled }: TeamActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit" disabled={disabled}>
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditTeam team={team} />
        <DeleteTeam id={team.id} />
      </MenuContent>
    </MenuRoot>
  );
};
