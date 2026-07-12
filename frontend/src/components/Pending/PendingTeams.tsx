import { Skeleton, VStack } from "@chakra-ui/react";

const PendingTeams = () => (
  <VStack gap={2} pt={8}>
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} height="40px" width="100%" />
    ))}
  </VStack>
);

export default PendingTeams;
