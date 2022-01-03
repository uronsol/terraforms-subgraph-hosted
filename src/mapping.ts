import {
  Daydreaming as DaydreamingEvent,
  Terraformed as TerraformedEvent,
  TokensRevealed as TokensRevealedEvent,
  Transfer as TransferEvent,
  Terraforms,
} from "../generated/Terraforms/Terraforms"
import {
  Daydreaming,
  Terraformed,
  TokensRevealed,
  SupplementalData,
  Token,
  Terraformer
} from "../generated/schema"
// import { getSupplementalData } from "./supplemental"

export function handleDaydreaming(event: DaydreamingEvent): void {
  let entity = new Daydreaming(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.tokenId = event.params.tokenId
  entity.save()
}


export function handleTerraformed(event: TerraformedEvent): void {
  let entity = new Terraformed(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.tokenId = event.params.tokenId
  entity.terraformer = event.params.terraformer
  entity.save()
}

export function handleTokensRevealed(event: TokensRevealedEvent): void {
  let entity = new TokensRevealed(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.timestamp = event.params.timestamp
  entity.seed = event.params.seed
  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  const tokenIdStr = event.params.tokenId.toString()
  let contract = Terraforms.bind(event.address)
  let token = Token.load(tokenIdStr)
  if (!token) {
    token = new Token(tokenIdStr)
    token.tokenID = event.params.tokenId
    token.createdAt = event.block.timestamp
    token.tokenURI = contract.tokenURI(event.params.tokenId)
  }

  token.supplementalData = tokenIdStr
  token.terraformer = event.params.to.toHexString()
  token.save()

  let terraformer = Terraformer.load(event.params.to.toHexString())
  if (!terraformer) {
    terraformer = new Terraformer(event.params.to.toHexString())
    terraformer.save()
  }

  let supplementalData = SupplementalData.load(tokenIdStr)
  let supplementalRes = contract.try_tokenSupplementalData(event.params.tokenId)
  let supplemental = supplementalRes

  if (!supplementalData && supplementalRes.reverted) {
    // Only use the json data if we can't find anything at all
    // const storedSupplemental = getSupplementalData((parseInt(tokenIdStr) - 1) as i32)
    // if (!storedSupplemental) return
    // supplementalData = new SupplementalData(tokenIdStr)
    // supplementalData.tokenID = storedSupplemental.tokenId.toString()
    // supplementalData.level = storedSupplemental.level
    // supplementalData.xCoordinate = storedSupplemental.xCoordinate
    // supplementalData.yCoordinate = storedSupplemental.yCoordinate
    // supplementalData.elevation = storedSupplemental.elevation
    // supplementalData.structureSpaceX = storedSupplemental.structureSpaceX
    // supplementalData.structureSpaceY = storedSupplemental.structureSpaceY
    // supplementalData.structureSpaceZ = storedSupplemental.structureSpaceZ
    // supplementalData.zoneName = storedSupplemental.zoneName
    // supplementalData.zoneColors = storedSupplemental.zoneColors
    // supplementalData.characterSet = storedSupplemental.characterSet
    // supplementalData.save()
    return
  }

  supplementalData = new SupplementalData(tokenIdStr)
  supplementalData.tokenID = supplemental.value.tokenId.toString()
  supplementalData.level = supplemental.value.level
  supplementalData.xCoordinate = supplemental.value.xCoordinate
  supplementalData.yCoordinate = supplemental.value.yCoordinate
  supplementalData.elevation = supplemental.value.elevation
  supplementalData.structureSpaceX = supplemental.value.structureSpaceX
  supplementalData.structureSpaceY = supplemental.value.structureSpaceY
  supplementalData.structureSpaceZ = supplemental.value.structureSpaceZ
  supplementalData.zoneName = supplemental.value.zoneName
  supplementalData.zoneColors = supplemental.value.zoneColors
  supplementalData.characterSet = supplemental.value.characterSet
  supplementalData.save()
}
