function solveAll() {
    solveAnimations();
    solveMultipleChoice();
    solveShortAnswer();
    fillOutDefinitions(); // Include fill out definitions in the solveAll function
}

function nextPage() {
    let nextBtn = document.getElementsByClassName('nav-text next');
    if (nextBtn.length > 0) {
        nextBtn[0].click();
    }
}

function getStatus() {
    let status = document.querySelectorAll('div.activity-title-bar > div.activity-description > div.title-bar-chevron-container > div');
    let res = true;
    for (const s of status) {
        let question = s.parentElement.parentElement.parentElement.parentElement;
        try {
            if (question.children[1].children[1].children[1].className.includes('draggable')) 
                continue;
        }
        catch (e) {}
        if (s.ariaLabel != 'Activity completed') {
            res = false;
            break;
        }
    }
    return res;
}

function checkSpeedControl() {
    // Find the label with the text "2x speed"
    const speedLabel = Array.from(document.querySelectorAll('.speed-control label')).find(label => label.textContent.trim() === '2x speed');

    if (speedLabel) {
        console.log('2x speed label found.');
        // Find the corresponding checkbox input
        const checkbox = speedLabel.previousElementSibling;
        if (checkbox && checkbox.type === 'checkbox') {
            console.log('Checkbox found.');
            if (!checkbox.checked) {
                checkbox.click();
                console.log('Checkbox checked.');
            } else {
                console.log('Checkbox already checked.');
            }
        } else {
            console.log('Checkbox not found or not a checkbox element.');
        }
    } else {
        console.log('2x speed checkbox not found.');
    }
}

function solveAnimations() {
    checkSpeedControl(); // Call the function to check the 2x speed control

    for (const doubleSpeedBtn of document.querySelectorAll('[aria-label="2x speed"]'))
        doubleSpeedBtn.click();
    for (const startBtn of document.getElementsByClassName("start-button"))
        startBtn.click();

    setInterval(function () {
        if (document.getElementsByClassName("play-button").length > 0) {
            let playBtns = document.getElementsByClassName('play-button');
            for (let i = 0; i < playBtns.length; i++) {
                if (!playBtns[i].className.replace(/\s+/g, ' ').split(' ').includes('rotate-180')) {
                    playBtns[i].click();
                }
            }
        }
    }, 1500);
}

function solveMultipleChoice() {
    let i = 0;
    let mc = document.querySelectorAll('input[type=radio]');
    setInterval(() => {
        if (i < mc.length) {
            mc[i].click();
            i++;
        }
    }, 300);
}

function solveShortAnswer() {
    console.log(document.getElementsByClassName('show-answer-button'));
    for (const answerBtn of document.getElementsByClassName('show-answer-button')) {
        setTimeout(() => answerBtn.click(), 300);
        setTimeout(() => answerBtn.click(), 300);
    }

    setTimeout(() => {
        let answers = document.getElementsByClassName('forfeit-answer');
        let answerBoxes = document.getElementsByClassName('zb-text-area');

        // start of my addition
        let answersModified = [];

        // Filter valid answers
        for (let i = 0; i < answers.length; i++) {
            if (answers[i].previousElementSibling == null ||
                answers[i].previousElementSibling.innerHTML !== "or") {
                answersModified.push(answers[i]);
            }
        }

        // Populate answer boxes with valid answers
        for (let i = 0; i < answersModified.length; i++) {
            setTimeout(() => answerBoxes[i].focus(), 1000);
            setTimeout(() => answerBoxes[i].select(), 1000);

            setTimeout(() => {
                // Replace HTML entities and set the answer box values
                answerBoxes[i].value = lookForTypos(answersModified[i].innerHTML);
                answerBoxes[i].dispatchEvent(new Event('input', { bubbles: true }));
            }, 1000);
        }

        for (const checkBtn of document.getElementsByClassName('check-button')) {
            setTimeout(() => checkBtn.click(), 1000);
            setTimeout(() => checkBtn.click(), 1000);
        }
    }, 1000);
}

// Function to simulate drag and drop
function simulateDragDrop(sourceNode, destinationNode) {
    const rect = destinationNode.getBoundingClientRect();
    const x = rect.left + (rect.width / 2);
    const y = rect.top + (rect.height / 2);

    const dataTransfer = new DataTransfer();

    sourceNode.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer }));
    destinationNode.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
    destinationNode.dispatchEvent(new DragEvent('dragover', { bubbles: true, clientX: x, clientY: y, dataTransfer }));
    destinationNode.dispatchEvent(new DragEvent('drop', { bubbles: true, clientX: x, clientY: y, dataTransfer }));
    sourceNode.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer }));
}

// Function to fill out all definitions with terms
function fillOutDefinitions() {
    const termElements = Array.from(document.querySelectorAll('.js-draggableObject'));
    const definitionContainers = Array.from(document.querySelectorAll('.definition-row'));

    termElements.forEach((termElement, index) => {
        if (index < definitionContainers.length) {
            setTimeout(() => {
                const termContainer = termElement;
                const definitionBucket = definitionContainers[index].querySelector('.term-bucket');

                console.log(`Dragging term "${termContainer.querySelector('span').textContent.trim()}" to definition ${index + 1}.`);
                simulateDragDrop(termContainer, definitionBucket);
            }, index * 1000); // 1000ms delay between each drag-and-drop action
        }
    });
}

// The html was replacing the answer with HTML characters "&amp &lt &gt"
// So I've had those replaced with their correct characters and the result
// returned
function lookForTypos(answer) {
    let answerInnerHtml = answer;

    if (answerInnerHtml.includes("&amp;")) {
        answerInnerHtml = answerInnerHtml.replaceAll("&amp;", "&");
        console.log("& replaced " + answerInnerHtml);
    }
    if (answerInnerHtml.includes("&lt;")) {
        answerInnerHtml = answerInnerHtml.replaceAll("&lt;", "<");
        console.log("< replaced " + answerInnerHtml);
    }
    if (answerInnerHtml.includes("&gt;")) {
        answerInnerHtml = answerInnerHtml.replaceAll("&gt;", ">");
        console.log("> replaced " + answerInnerHtml);
    }
    console.log("answerInnerHtml: " + answer);
    console.log("replaced answer: " + answerInnerHtml);

    return answerInnerHtml;
}

// Execute the function
fillOutDefinitions();

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch (request.message) {
            case "solveAuto":
                console.log("Solving automatically");
                solveAll();
                setInterval(() => {
                    if (getStatus()) {
                        nextPage();
                        setTimeout(() => solveAll(), 1000);
                    }
                }, 1000);
                break;
            case "solveAll":
                solveAll();
                break;
            case "solveAnimations":
                solveAnimations();
                break;
            case "solveMC":
                solveMultipleChoice();
                break;
            case "solveDND":
                fillOutDefinitions();
                break;
            case "solveSA":
                solveShortAnswer();
                break;
            default:
                console.log("Unknown message: " + request.message);
        }
    }
);