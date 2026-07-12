import { Table } from "@chakra-ui/react"
import { Skeleton } from "../ui/skeleton"

const PendingLeaveTypes = () => {
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
                    <Table.ColumnHeader w="sm">Code</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
                    <Table.ColumnHeader w="md">Description</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>{skeletons}</Table.Body>
        </Table.Root>
    )
}

export default PendingLeaveTypes
