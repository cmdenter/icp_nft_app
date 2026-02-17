#!/bin/bash
# Seed 50 NFTs with randomized traits
PRINCIPAL=$(dfx identity get-principal)
echo "Seeding 50 NFTs for principal: $PRINCIPAL"

BACKGROUNDS=("Blue" "Red" "Green" "Purple" "Gold" "Black" "White" "Orange")
RARITIES=("Common" "Common" "Common" "Uncommon" "Uncommon" "Rare" "Rare" "Legendary")
EYES=("Normal" "Laser" "Closed" "Stars" "Cyber" "Diamond")
HATS=("None" "Cap" "Crown" "Helmet" "Beanie" "Halo")

for i in $(seq 1 50); do
  BG=${BACKGROUNDS[$((RANDOM % ${#BACKGROUNDS[@]}))]}
  RARITY=${RARITIES[$((RANDOM % ${#RARITIES[@]}))]}
  EYE=${EYES[$((RANDOM % ${#EYES[@]}))]}
  HAT=${HATS[$((RANDOM % ${#HATS[@]}))]}

  dfx canister call nft mint "(
    principal \"$PRINCIPAL\",
    \"Speed NFT #$i\",
    \"A high-performance NFT with unique traits, minted on the Internet Computer.\",
    \"https://picsum.photos/seed/nft$i/400/400\",
    vec {
      record { category = \"Background\"; value = \"$BG\" };
      record { category = \"Rarity\"; value = \"$RARITY\" };
      record { category = \"Eyes\"; value = \"$EYE\" };
      record { category = \"Hat\"; value = \"$HAT\" }
    }
  )" > /dev/null 2>&1
  echo "  Minted #$i [$BG | $RARITY | $EYE | $HAT]"
done

echo "Seeded 50 NFTs successfully"
