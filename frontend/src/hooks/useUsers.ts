import { useQuery } from "@tanstack/react-query"
import { UsersService, type UserPublic } from "@/client"

export const useUsers = () => {
    return useQuery({
        queryKey: ["users", "all"],
        queryFn: async () => {
            // Fetch all users without pagination for dropdown
            const response = await UsersService.readUsers({ limit: 1000 })
            return response.data
        },
        select: (users: UserPublic[]) =>
            users
                .filter(user => user.is_active && user.email) // Ensure user has email
                .map(user => ({
                    id: user.id,
                    name: user.full_name?.trim() || user.email,
                    email: user.email,
                })),
    })
}