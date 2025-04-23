import { useState } from "react";
import { Box, Button, Container, Heading, Text, VStack, useToast, Spinner, SimpleGrid, Image } from "@chakra-ui/react";
import { useAccount, useContractWrite, usePrepareContractWrite, useContractRead } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../src/constants";

export default function Home() {
  const { address, isConnected } = useAccount();
  const toast = useToast();
  const [minting, setMinting] = useState(false);
  const [ownedTokens, setOwnedTokens] = useState<number[]>([]);

  // Prepare mint function (only owner can mint)
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "mint",
    args: [address],
    enabled: Boolean(address),
  } as any);
  const { write: mint } = useContractWrite({
    ...config,
    onSuccess: () => {
      toast({ title: "Minted!", status: "success" });
      setMinting(false);
      fetchOwned();
    },
    onError: (e) => {
      toast({ title: "Mint failed", description: e.message, status: "error" });
      setMinting(false);
    },
  });

  // Read owned tokens (simple demo, assumes sequential IDs)
  const fetchOwned = async () => {
    if (!address) return;
    setOwnedTokens([]);
    let found = true;
    let tokens: number[] = [];
    for (let i = 1; found; i++) {
      try {
        const owner = await (window as any).ethereum.request({
          method: 'eth_call',
          params: [{
            to: CONTRACT_ADDRESS,
            data: "0x6352211e" + i.toString(16).padStart(64, '0') // ownerOf(uint256)
          }, 'latest'],
        });
        if (owner && owner.toLowerCase().includes(address.toLowerCase().slice(2))) {
          tokens.push(i);
        }
      } catch {
        found = false;
      }
    }
    setOwnedTokens(tokens);
  };

  return (
    <Container maxW="lg" pt={10}>
      <VStack spacing={6} align="stretch">
        <Heading bgGradient="linear(to-r, brand.500, brand.600)" bgClip="text" fontSize="4xl">NFTMan Sepolia NFT</Heading>
        <ConnectButton />
        {isConnected && (
          <>
            <Button
              colorScheme="purple"
              isLoading={minting}
              onClick={() => {
                setMinting(true);
                mint && mint();
              }}
              mt={4}
            >
              Mint NFT
            </Button>
            <Button onClick={fetchOwned} mt={2} variant="outline">Show My NFTs</Button>
            <SimpleGrid columns={[1, 2]} spacing={4} mt={4}>
              {ownedTokens.length === 0 && <Text>No NFTs found.</Text>}
              {ownedTokens.map((tokenId) => (
                <Box key={tokenId} borderWidth={1} rounded="md" p={3} textAlign="center" bg="white" boxShadow="md">
                  <Image src={`/nft/${tokenId}.png`} alt={`NFT #${tokenId}`} fallback={<Box h="120px" />} mx="auto" mb={2} />
                  <Text fontWeight="bold">NFT #{tokenId}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </>
        )}
      </VStack>
    </Container>
  );
}
