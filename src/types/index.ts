import { BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin'

/**
 * Application-specific type definitions
 */

export interface PluginState {
  currentPageOriginalName: PageEntity['originalName']
  logseqVersion: string
  logseqVersionMd: boolean
}

export interface ProcessingFlags {
  processingBlockChanged: boolean
  onBlockChangedOnce: boolean
  processingOnPageChanged: boolean
}

export interface PageChangeCallbackOptions {
  zoomIn: boolean
  zoomInUuid: BlockEntity['uuid']
}

export interface VersionInfo {
  version: string
  isMdVersion: boolean
}

export interface ContainerElements {
  nav: HTMLDivElement | null
  container: HTMLDivElement | null
  content: HTMLDivElement | null
}

export interface TOCSettings {
  booleanLeftTOC: boolean
  tocRemoveWordList: string
  booleanAsZoomPage: boolean
  highlightBlockOnHover: boolean
  booleanTableOfContents: boolean
}

export type PluginSettings = TOCSettings & Record<string, any>

export interface ErrorContext {
  operation: string
  details?: Record<string, unknown>
  error: Error
}