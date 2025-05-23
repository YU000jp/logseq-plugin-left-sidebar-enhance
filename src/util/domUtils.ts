/**
 * Utility function to create an HTML element with attributes and optional text content.
 */
export const createElementWithAttributes = (tag: string, attributes: { [key: string]: string }, textContent?: string): HTMLElement => {
             const element = document.createElement(tag)
             Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
             if (textContent) element.textContent = textContent
             return element
}


/**
 * Scrolls to a specific element with an offset.
 */
export const scrollToWithOffset = (element: HTMLElement) => {
             element.scrollIntoView({
                          block: 'center',
                          inline: 'nearest',
                          behavior: 'smooth'
             })
             // const offset = 100; // Example offset value
             // const top = element.getBoundingClientRect().top + window.scrollY - offset;
             // window.scrollTo({ top, behavior: "smooth" });
}