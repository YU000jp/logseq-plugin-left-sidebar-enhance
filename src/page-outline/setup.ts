import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import { booleanLogseqVersionMd, getCurrentPageOriginalName } from ".."
import { headerCommand } from "../headerCommand"
import { createElementWithAttributes } from "../utils/domUtils"
import { removeContainer } from "../utils/lib"
import { refreshPageHeaders } from "./pageHeaders"
import { routeCheck } from "./routeCheck"
import { logger } from "../utils/logger"
import { ELEMENT_IDS, TIMEOUTS, CSS_SELECTORS } from "../config/constants"
import tocCSS from "./toc.css?inline"


// Plugin startup lock (5 seconds after startup)
let processing = true

export const setupTOCHandlers = (versionMd: boolean): void => {
    setTimeout(() => {
        // Plugin settings change handler
        logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
            if (processing) return
            
            if (oldSet.booleanLeftTOC !== newSet.booleanLeftTOC) {
                if (newSet.booleanLeftTOC === true) {
                    renderTOCContainer()
                    logger.info('TOC container enabled')
                } else {
                    removeContainer(ELEMENT_IDS.TOC_CONTAINER)
                    logger.info('TOC container disabled')
                }
            }
            
            if ((oldSet.tocRemoveWordList !== newSet.tocRemoveWordList) ||
                (oldSet.booleanAsZoomPage !== newSet.booleanAsZoomPage)) {
                await refreshPageHeaders(getCurrentPageOriginalName())
                logger.debug('Page headers refreshed due to settings change')
            }
        })
        
        logseq.App.onCurrentGraphChanged(async () => {
            routeCheck(versionMd)
            logger.debug('Route check executed on graph change')
        })
        
        processing = false // Release the lock
        logger.debug('TOC handlers setup completed, processing lock released')
    }, TIMEOUTS.PROCESSING_LOCK_DURATION)

    if (logseq.settings!.booleanLeftTOC === true) {
        renderTOCContainer()
        logger.debug('Initial TOC container rendered')
    }

    // Apply version-specific styles
    const additionalCSS = versionMd === false ? `
        #main-content-container div.ls-page-blocks { 
            overflow: visible;
        }
        #left-container {
            display: unset;
            position: static;
        }
    ` : ""
    
    logseq.provideStyle(tocCSS + additionalCSS)
    logger.debug('TOC styles applied', { versionMd, hasAdditionalCSS: !!additionalCSS })

    // Initial route check
    setTimeout(() => {
        routeCheck(versionMd)
        logger.debug('Initial route check completed')
    }, TIMEOUTS.ROUTE_CHECK_DELAY)

    // Setup route change handler
    logseq.App.onRouteChanged(async () => {
        await routeCheck(versionMd)
        logger.debug('Route check executed on route change')
    })

    // Setup header command
    headerCommand()
    logger.debug('Header command setup completed')
}


const renderTOCContainer = (): void => {
    const versionMd = booleanLogseqVersionMd()
    
    // Remove existing container if present
    if (parent.document.getElementById(ELEMENT_IDS.TOC_CONTAINER)) {
        removeContainer(ELEMENT_IDS.TOC_CONTAINER)
        logger.debug('Existing TOC container removed before re-rendering')
    }

    setTimeout(async () => {
        try {
            // Find the appropriate navigation container based on version
            const navSelector = versionMd === true 
                ? CSS_SELECTORS.LEFT_SIDEBAR_MD 
                : CSS_SELECTORS.LEFT_SIDEBAR_DB
            
            const navEle = parent.document.querySelector(navSelector) as HTMLDivElement || null
            
            if (navEle === null) {
                logger.warn('Navigation container not found', { navSelector })
                return
            }

            // Create container structure
            const divAsItemEle = createElementWithAttributes("div", {
                class: "nav-content-item mt-3 is-expand flex-shrink-0",
                id: ELEMENT_IDS.TOC_CONTAINER,
            })
            
            const detailsEle = createElementWithAttributes("details", {
                class: "nav-content-item-inner",
                open: "true",
            })
            
            const summaryEle = createElementWithAttributes("summary", {
                class: "header items-center",
                title: "Left Sidebar Enhance " + t("plugin"),
            })
            summaryEle.innerText = t("Page Outline")
            
            const containerEle = createElementWithAttributes("div", {
                class: "bd",
                id: ELEMENT_IDS.TOC_INNER,
            })

            // Assemble the structure
            detailsEle.appendChild(summaryEle)
            detailsEle.appendChild(containerEle)
            divAsItemEle.appendChild(detailsEle)
            navEle.appendChild(divAsItemEle)

            logger.info('TOC container structure created successfully')

            // Setup inner content with delay
            setTimeout(() => {
                setupTOCInnerContent()
            }, TIMEOUTS.CONTAINER_FLAG_DELAY)
            
        } catch (error) {
            logger.error('Failed to render TOC container', error)
        }
    }, TIMEOUTS.CONTAINER_SETUP_DELAY)
}

/**
 * Setup the inner content of the TOC container
 */
const setupTOCInnerContent = (): void => {
    try {
        const containerEle: HTMLDivElement | null = parent.document.getElementById(ELEMENT_IDS.TOC_INNER) as HTMLDivElement | null
        
        if (containerEle === null) {
            logger.warn('TOC inner container not found')
            return
        }

        if (containerEle.dataset.flag !== "true") {
            const divEle = createElementWithAttributes("div", {
                id: ELEMENT_IDS.TOC_CONTENT,
            })
            containerEle.appendChild(divEle)
            logger.debug('TOC content div added')
        }
        
        containerEle.dataset.flag = "true"
        logger.debug('TOC container setup completed with flag')
        
    } catch (error) {
        logger.error('Failed to setup TOC inner content', error)
    }
}
