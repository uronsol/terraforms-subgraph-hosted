import {
  Daydreaming as DaydreamingEvent,
  Terraformed as TerraformedEvent,
  Transfer as TransferEvent,
  Terraforms,
} from "../generated/Terraforms/Terraforms"
import {
  Daydreaming,
  Terraformed,
  SupplementalData,
  Token,
  Terraformer,
  RenderData
} from "../generated/schema"

import { BigInt, ipfs } from '@graphprotocol/graph-ts'
import { json } from '@graphprotocol/graph-ts'

const ipfsTokenArray = 'Qmb4T1ULA5Q9WoJ4LedyE5sWKtoyn5FJV2bvfxjBfM3pHt'
const ipfsRenderArray = 'QmV1vkvQJRxUFeVR2Yf6Xp3Q3inTZWyRReejZp3x8fVxEx'

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
  token.renderData = tokenIdStr
  token.terraformer = event.params.to.toHexString()
  token.save()

  let terraformer = Terraformer.load(event.params.to.toHexString())
  if (!terraformer) {
    terraformer = new Terraformer(event.params.to.toHexString())
    terraformer.save()
  }

  let supplementalData = SupplementalData.load(tokenIdStr)
  let supplementalRes = contract.try_tokenSupplementalData(event.params.tokenId)
  if (!supplementalData && supplementalRes.reverted) {
    const tokenHashes = ipfs.cat(ipfsTokenArray)
    if (!tokenHashes) {
      return
    }
    const hashesJson = json.fromBytes(tokenHashes)
    const hashesJsonArray = hashesJson.toArray()
    const hashes: string[] = []
    for (let i = 0; i < hashesJsonArray.length; i++) {
      hashes.push(hashesJsonArray[i].toString())
    }
    const hash = hashes[event.params.tokenId.toI32() - 1]
    if (!hash) {
      return
    }
    let data = ipfs.cat(hash)
    if (!data) {
      return
    }
    const terraform = json.fromBytes(data).toObject()
    if (!terraform) {
      return
    }
    const level = terraform.get("level")
    const xCoordinate = terraform.get("xCoordinate")
    const yCoordinate = terraform.get("yCoordinate")
    const elevation = terraform.get("elevation")
    const zoneName = terraform.get("zoneName")
    const seedValue = terraform.get("seedValue")
    const zoneColors = terraform.get("zoneColors")
    const characterSet = terraform.get("characterSet")
    supplementalData = new SupplementalData(tokenIdStr)
    if (level && !level.isNull()) {
      supplementalData.level = BigInt.fromString(level.toString())
    }
    if (xCoordinate && !xCoordinate.isNull()) {
      supplementalData.xCoordinate = BigInt.fromString(xCoordinate.toString())
    }
    if (yCoordinate && !yCoordinate.isNull()) {
      supplementalData.yCoordinate = BigInt.fromString(yCoordinate.toString())
    }
    if (elevation && !elevation.isNull()) {
      supplementalData.elevation = BigInt.fromString(elevation.toString())
    }
    if (zoneName && !zoneName.isNull()) {
      supplementalData.zoneName = zoneName.toString()
    }
    if (seedValue && !seedValue.isNull()) {
      supplementalData.seedValue = BigInt.fromString(seedValue.toString())
    }
    if (zoneColors && !zoneColors.isNull()) {
      supplementalData.zoneColors = zoneColors.toString().split('|-|')
    }
    if (characterSet && !characterSet.isNull()) {
      supplementalData.characterSet = characterSet.toString().split('|-|')
    }
    supplementalData.token = tokenIdStr
    supplementalData.save()
  } else if (supplementalData) {
    supplementalData.level = supplementalRes.value.level
    supplementalData.xCoordinate = supplementalRes.value.xCoordinate
    supplementalData.yCoordinate = supplementalRes.value.yCoordinate
    supplementalData.elevation = supplementalRes.value.elevation
    supplementalData.zoneName = supplementalRes.value.zoneName
    supplementalData.zoneColors = supplementalRes.value.zoneColors
    supplementalData.characterSet = supplementalRes.value.characterSet
    supplementalData.token = tokenIdStr
    supplementalData.save()
  }

  let renderData = RenderData.load(tokenIdStr)
  if (!renderData) {
    const renderDataHashes = ipfs.cat(ipfsRenderArray)
    if (!renderDataHashes) {
      return
    }
    const hashesJson = json.fromBytes(renderDataHashes)
    const hashesJsonArray = hashesJson.toArray()
    const hashes: string[] = []
    for (let i = 0; i < hashesJsonArray.length; i++) {
      hashes.push(hashesJsonArray[i].toString())
    }
    const hash = hashes[event.params.tokenId.toI32() - 1]
    if (!hash) {
      return
    }
    let data = ipfs.cat(hash)
    if (!data) {
      return
    }
    const terraform = json.fromBytes(data).toObject()
    if (!terraform) {
      return
    }
    const fontFamily = terraform.get("fontFamily")
    const fontString = terraform.get("fontString")
    const structureSpaceX = terraform.get("structureSpaceX")
    const structureSpaceY = terraform.get("structureSpaceY")
    const structureSpaceZ = terraform.get("structureSpaceZ")
    const tokenHTML = terraform.get("tokenHTML")
    const tokenSVG = terraform.get("tokenSVG")
    renderData = new RenderData(tokenIdStr)
    if (fontFamily && !fontFamily.isNull()) {
      renderData.fontFamily = fontFamily.toString()
    }
    if (fontString && !fontString.isNull()) {
      renderData.fontString = fontString.toString()
    }
    if (structureSpaceX && !structureSpaceX.isNull()) {
      renderData.structureSpaceX = BigInt.fromString(structureSpaceX.toString())
    }
    if (structureSpaceY && !structureSpaceY.isNull()) {
      renderData.structureSpaceY = BigInt.fromString(structureSpaceY.toString())
    }
    if (structureSpaceZ && !structureSpaceZ.isNull()) {
      renderData.structureSpaceZ = BigInt.fromString(structureSpaceZ.toString())
    }
    if (tokenHTML && !tokenHTML.isNull()) {
      renderData.tokenHTML = tokenHTML.toString()
    }
    if (tokenSVG && !tokenSVG.isNull()) {
      renderData.tokenSVG = tokenSVG.toString()
    }
    renderData.token = tokenIdStr
    renderData.save()
  }
}
