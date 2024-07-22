console.info('contentScript is running')

let clickedElement: Element | null;

document.addEventListener("contextmenu", event => {
    if (event.button === 2 && event.target instanceof Element) {
        clickedElement = event.target;
    }
}, true);

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request === "CONTEXT_MENU_CLICKED") {
        if (clickedElement && clickedElement.parentElement) {
            const parentElement = clickedElement.parentElement;
            const parentRect = parentElement.getBoundingClientRect();

            // TODO: Add type definitions for documentPictureInPicture.
            const pipWindow = await documentPictureInPicture.requestWindow({
                width: parentRect.width,
                height: parentRect.height,
            });

            // Copy style sheets over from the initial document so that contents
            // in the PiP window look the same.
            // Copied from: https://mdn.github.io/dom-examples/document-picture-in-picture/
            // TODO: Make this work for nested CSS rules.
            [...document.styleSheets].forEach((styleSheet) => {
                try {
                    const cssRules = [...styleSheet.cssRules]
                        .map((rule) => rule.cssText)
                        .join("");
                    const style = document.createElement("style");

                    style.textContent = cssRules;
                    pipWindow.document.head.appendChild(style);
                } catch (e) {
                    const link = document.createElement("link");

                    link.rel = "stylesheet";
                    link.type = styleSheet.type;
                    link.media = styleSheet.media;
                    link.href = styleSheet.href;
                    pipWindow.document.head.appendChild(link);
                }
            });

            pipWindow.document.body.append(parentElement);

            clickedElement = null;
        }

        sendResponse({ done: true });
    }
})

