// ---------------- DEFINITION OF ELEMENTS USED

const notepad = document.querySelector('#notepad')
// NAV
const pageLeftBtn = document.querySelector('#page-left')
const pageRightBtn = document.querySelector('#page-right')

// CONSOLE 
const inputTextArea = document.querySelector("#console-input")

// NOTES
const queueBtn = document.querySelector("#queue-btn")
const archiveBtn = document.querySelector("#archive-btn")
const noteList = document.querySelector("#note-list")

// COUNTERS
const pinCounterElement = document.querySelector("#pin-count")
const noteCounterElement = document.querySelector("#note-count")
const queueCounterElement = document.querySelector("#queue-count")
const archiveCounterElement = document.querySelector("#archive-count")

// FOOTER
const tips = document.querySelector('#tips');
const status = document.querySelector('#status-message');

// TEMPLATES
const noteTemplate = document.querySelector("#note-template")

// INTERACTIONS
const selection = window.getSelection();

// ------------------------ HELPER VARIABLES
let jsonStringContents = ""

let pageIndex = 0;
let totalPages = 1;

let totalConsoleLines = 0
let offsetConsoleUp = 0

let noteCount = 0
let pinCount = 0
let queueCount = 0

let asyncQueue = []

// ---------------------------------- JSON SHIT

// Load data from the server
async function loadData() {
    status.textContent = 'Loading data...';
    try {
        const response = await fetch('/api/data');

        if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        jsonStringContents = JSON.stringify(data, null, 2);
        status.textContent = 'Loaded data.json.';
    } catch (error) {
        status.textContent = `Load failed: ${error.message}`;
    }
}

// Save edited data to the server
async function saveData() {
    let data;

    // Validate JSON before sending it
    try {
        data = JSON.parse(jsonStringContents);
    } catch (error) {
        status.textContent = `Invalid JSON: ${error.message}`;
        return;
    }

    if (data === null || typeof data !== 'object') {
        status.textContent = 'JSON must be an object or array.';
        return;
    }
    status.textContent = 'Saving...';

    try {
        const response = await fetch('/api/data', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
        }

        jsonStringContents = JSON.stringify(data, null, 2);
        status.textContent = 'Saved successfully!';
    } catch (error) {
        status.textContent = `Save failed: ${error.message}`;
    }
}

// ------------ HANDLE NOTES
async function loadNotes() {
    await loadData();
    console.log(jsonStringContents)
    jsonObject = JSON.parse(jsonStringContents);
    idx = 0
    for (const note of jsonObject.notes) {
        wrapper = noteTemplate.content.cloneNode(true).querySelector("div.note-wrapper")
        noteParagraph = wrapper.querySelector("p.note")
        noteParagraph.textContent = note.text;
        noteIdxBtn = wrapper.querySelector("button.note-index")
        if(typeof(note.id) === "undefined") {
            note.id = generateNoteId();
        }
        wrapper.dataset.noteId = note.id;
        noteIdx = noteIdxBtn.querySelector("span")
        noteIdx.textContent = idx.toString().padStart(2, '0')
        noteList.appendChild(wrapper)
        idx++
    }
    await loadCounters()
    jsonStringContents = JSON.stringify(jsonObject, null, 2);
    await saveData()
}

function addNote(newNote) {
    wrapper = noteTemplate.content.cloneNode(true).querySelector("div.note-wrapper")
    noteParagraph = wrapper.querySelector("p.note")
    noteParagraph.textContent = newNote
    
    noteId = generateNoteId()
    wrapper.dataset.noteId = noteId;
    idx = noteCount;

    noteIdx = wrapper.querySelector("button.note-index span")
    noteIdx.textContent = idx.toString().padStart(2, '0')
    noteCount++;

    updateCounters();
    
    noteList.appendChild(wrapper)
    noteList.scrollTop = noteList.scrollHeight;
    localJsonAddNote(newNote, noteId)
    saveData()
}

function removeNote(noteId, noteWrapper) {
    jsonObject = JSON.parse(jsonStringContents);
    jsonObject.notes = jsonObject.notes.filter(note => note.id !== noteId)
    jsonStringContents = JSON.stringify(jsonObject, null, 2);
    saveData();

    noteWrapper.remove();
    noteCount --;
    updateCounters();
}

function generateNoteId() {
    const timestamp = Date.now().toString(36);
    const randString = Math.random().toString(36).substring(2, 9)
    return `${timestamp}-${randString}`
}
// function loadCounters(n, p, q) {
//     noteCounterElement.textContent = n
//     pinCounterElement.textContent = p
//     queueCounterElement.textContent = q
// }

async function loadCounters() {
    noteCount = jsonObject.notes.length
    pinCount = 0;
    queueCount = 0 ;
    noteCounterElement.textContent = noteCount
    pinCounterElement.textContent = 0;
    queueCounterElement.textContent = 0;
    archiveCounterElement.textContent = 0;
}

function updateCounters() {
    noteCounterElement.textContent = noteCount
    pinCounterElement.textContent = 0;
    queueCounterElement.textContent = 0;
    archiveCounterElement.textContent = 0;
}

function localJsonAddNote(newNote, noteId) {
    noteObj = {
        "id": noteId,
        "text": newNote,
        "pinned": false,
        "queued": false,
        "archived": false,
        "index": noteCount,
        "pinned_index": 0,
        "queued_index": 0,
        "md_file": "",
        "datetime": dateTimeNow()
    }
    jsonObject.notes.push(noteObj)
    jsonStringContents = JSON.stringify(jsonObject, null, 2);
}

function submitConsoleInput() {
    if (inputTextArea.value.trim().length === 0) {
        return
    }
    addNote(inputTextArea.value)
    inputTextArea.value = ''
    notepad.style.setProperty('--offset', '0em')
}

function selectAllNotesOnly(event) {
    if(document.activeElement !== noteList) return
    event.preventDefault();
    selection.selectAllChildren(noteList);
}

function dateTimeNow() {
    return formatDateTime(new Date());
}

function formatDateTime(date) {
  const code = {
    'YY': date.getFullYear().toString().slice(-2),
    'MM': String(date.getMonth() + 1).padStart(2, '0'),
    'DD': String(date.getDate()).padStart(2, '0'),
    'HH': String(date.getHours()).padStart(2, '0'),
    'mm': String(date.getMinutes()).padStart(2, '0'),
    'ss': String(date.getSeconds()).padStart(2, '0')
  };

  return `${code['YY']}${code['MM']}${code["DD"]}_${code["HH"]}${code["mm"]}`
}
// ----------------- NAV

function updatePage(pageN) {
    
}

inputTextArea.addEventListener('input', (event) => {
    totalConsoleLines = inputTextArea.value.split('\n').length
    notepad.style.setProperty('--offset', '0em')
    if(totalConsoleLines <= 3) return
    offsetConsoleUp = totalConsoleLines - 3
    notepad.style.setProperty('--offset', `${offsetConsoleUp}em`)
})

//--------------------------------EVENT LISTENERS

// --------------------------------- HANDLE NAV
pageLeftBtn.addEventListener('click', () => {
    pageIndex --;
    if (pageIndex <0) {
        pageIndex = totalPages-1
    }
    updatePage(pageIndex)
})
pageRightBtn.addEventListener('click', () => {
    pageIndex ++;
    if (pageIndex >= totalPages) {

        pageIndex = 0
    }
    updatePage(pageIndex)
})

queueBtn.addEventListener('click', () => {
    queueBtn.classList.toggle('active')
    if (queueBtn.classList.contains('active')) {

    }
})

archiveBtn.addEventListener('click', () => {
    archiveBtn.classList.toggle('active')
    if (archiveBtn.classList.contains('active')) {

    }
})

// -------------------------------- KEY PRESSING
document.addEventListener('keydown', (event) => {
    // if (event.key == 'Tab') {
    //     event.preventDefault();
    // }
    // else if (event.key == '')
    
    switch (event.key) {
        case 'Enter':
            if(event.shiftKey) break;
            event.preventDefault();
            if(event.repeat) break;
            if(inputTextArea == document.activeElement) {
                submitConsoleInput()
            }
            inputTextArea.focus()
            break;
        case 'ArrowLeft':
            event.preventDefault();
            if(event.repeat) break;
            pageLeftBtn.classList.add('active')
            pageLeftBtn.click()
            break
        case 'ArrowRight':
            event.preventDefault();
            if(event.repeat) break;
            pageRightBtn.classList.add('active');
            pageRightBtn.click();
            break;
        case 'q':
            if(!event.altKey) break;
            event.preventDefault();
            queueBtn.click();
            break;
        case 'a':
            if(!event.altKey) break;
            event.preventDefault();
            archiveBtn.click();
            break;
    }
    if(!event.ctrlKey) return;
    switch (event.key) {
        case 'a':
            selectAllNotesOnly(event);
    }
})

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            pageLeftBtn.classList.remove('active')
            break
        case 'ArrowRight':
            event.preventDefault();
            pageRightBtn.classList.remove('active')
            break
    }
})
let rmbDownTarget = null;

document.addEventListener('mousedown', (event) => {
    if(event.button == 2) {
        const clickedElement = event.target;
        if (clickedElement === null) return;
        rmbDownTarget = clickedElement;
        if (clickedElement.matches('.note-index')) {
            event.preventDefault();
            let wrapper = clickedElement.parentElement;
            let noteIdxBtn = wrapper.querySelector('button.note-index')
            noteIdxBtn.classList.add("delete")
        }
    }
})

// document.addEventListener('mouseup', (event) => {
//     event.preventDefault();
//     if(clickedElement !== rmbDownTarget) {
//         event.preventDefault();
//     }
//     if (event.button == 2) {
//         const clickedElement = event.target;
//         if (clickedElement === null) return;
//         if (clickedElement === rmbDownTarget) {
//             let wrapper = clickedElement.parentElement;
//             let noteId = wrapper.dataset.noteId;
//             removeNote(noteId, wrapper);
//         } else if (rmbDownTarget.matches('.note-index')){
//             let wrapper = rmbDownTarget.parentElement;
//             let noteIdxBtn = wrapper.querySelector('button.note-index')
//             noteIdxBtn.classList.remove("delete")
//         }
//     }   
//     rmbDownTarget = null;
// })

document.addEventListener('contextmenu', (event) => {
    const clickedElement = event.target;
    if(clickedElement !== rmbDownTarget) {
        event.preventDefault();
    }
    if (clickedElement === null) return;
    if (clickedElement === rmbDownTarget && clickedElement.matches('.note-index')) {
        event.preventDefault();
        let wrapper = clickedElement.parentElement;
        let noteId = wrapper.dataset.noteId;
        removeNote(noteId, wrapper);
    } else if (rmbDownTarget.matches('.note-index')){
        let wrapper = rmbDownTarget.parentElement;
        let noteIdxBtn = wrapper.querySelector('button.note-index')
        noteIdxBtn.classList.remove("delete")
    }
    rmbDownTarget = null;
})


//     const clickedElement = event.target;
//     if (clickedElement === null) return;
//     if (clickedElement.matches('.note-index')) {
//         event.preventDefault();
//         let wrapper = clickedElement.parentElement;
//         let noteId = wrapper.dataset.noteId;
//         removeNote(noteId, wrapper);
        
//     }
// })

async function main() {

    await loadNotes(); // Load JSON when the page opens
}

main()