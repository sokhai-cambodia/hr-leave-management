import { Table } from "@chakra-ui/react"
import { Skeleton } from "../ui/skeleton"

const PendingLeaveBalances = () => {
    const skeletons = Array(5)
        .fill(null)
        .map((_, i) => (
            <Table.Row key={i}>
                <Table.Cell>
                    <Skeleton height="20px" />
                </Table.Cell>
                <Table.Cell>
                    <Skeleton height="20px" />
                </Table.Cell>
                <Table.Cell>
                    <Skeleton height="20px" />
                </Table.Cell>
                <Table.Cell>
                    <Skeleton height="20px" />
                </Table.Cell>
                <Table.Cell>
                    <Skeleton height="20px" />
                </Table.Cell>
            </Table.Row>
        ))

    return (
        <Table.Root size={{ base: "sm", md: "md" }}>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader w="sm">Year</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Balance</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Leave Type ID</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Owner ID</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>{skeletons}</Table.Body>
        </Table.Root>
    )
}

export default PendingLeaveBalances
