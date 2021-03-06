// What my comments mean / other information relevant to my code:


// This JavaScript document is less documented compared to my other scripts (specifically database.js), there are a few reasons for this:
// Database.js is as close to an "API" as we get, and those need the best documentation, as they are literally used by other developers, instead of "just" as a way to grade our assignment


// After a couple of days of development I opted into learning, and utilizing jquery.
// Already I feel somewhat competent in the basics, but it means that some things are a little weird.
// For example, in some functions, I input JS Dom Elements, but then convert those into jquery afterwards. instead of simply inserting the jquery dom element from the start
// I was planning on fixing all of those inconsistencies, but If there are some left, I'm sorry. There were simply more pressing issues that needed to be addressed beforehand.
// All that said, I don't think you should ever go "all-in" on any library / framework, as it has the possibility of reducing performance for no real gain.
// Only use it when it's actually somewhat beneficial (saves time mostly, as performance is not a super-important factor with this project


// If there are some weird things where the naming makes absolutely no sense and it says *..let..* where it clearly should say *..var..* (like for example "letiables" instead of "variables") that was because I changed all my 'var' into 'let' halfway into the project.


// Some 'less than ideal' things:

// Minor quirk: If you hover over the note while it is inside the trashCan, the :hover CSS selector will activate. This is unintended.


// Archaic variables (pre-jquery)
// This was mostly in order to be able to utilize the event.which jquery extension that has better cross-compatability with browsers for button clicks

// let container = document.querySelector("#incubatorContainer");

// // Touch events
// container.addEventListener("touchstart", DragStart);
// container.addEventListener("touchend", DragEnd);
// container.addEventListener("touchmove", Drag);

// // Mouse events
// container.addEventListener("mousedown", DragStart);
// container.addEventListener("mouseup", DragEnd);
// container.addEventListener("mousemove", Drag);

// TODO: Fix the misaligned dragging

const container = $("#incubatorContainer");
const trashCan = $("#trashCan");
const approvalBox = $("#approvalBox");
const sidebar = $("#sidebar");

    // which item you are dragging
let activeDragNote = null;
let activeRightClickNote = null;
let currentZIndex = 0;

// Related to deleting a note
    // This has to be true. It doesn't work anymore if set to false : This bug was noticed 1hour, 50 minutes before the deadline
let requireWaitingUntilDeletionAnimationIsComplete = true;


let aboveTrashCan = false;

// Related to approving a note

    // This has to be true. It doesn't work anymore if set to false : This bug was noticed 1hour, 50 minutes before the deadline
let requireWaitingUntilApprovalAnimationIsComplete = true;


let aboveApprovalBox = false;

// Touch events
container.on("touchstart", DragStart);
container.on("touchend", DragEnd);
container.on("touchmove", Drag);

// Mouse events
container.on("mousedown", DragStart);
container.on("mouseup", DragEnd);
container.on("mousemove", Drag);

container.on("focusout", SaveNoteTextToTask);

/**
 * Not a super-fan of this implementation, as it's an ever-increasing index, but it works
 */
function GetNextZIndex() {
    currentZIndex++;
    return currentZIndex;
}

function DragStart(e) {
    
        // If it's not left button (meaning right-button, middle click etc..), return.
        // Only allow dragging with left-click
    if (!IsLeftButton(e)) return;
    
    activeDragNote = GetNoteDiv(e.target);
        // If you're not holding a note, return.
    if (activeDragNote == null) return;
    e.preventDefault();
    SetNoteDefaultPositionValues(activeDragNote, e);

    let tempPos = GetMousePosition(e);
    
    SetNoteDefaultPositionValues(activeDragNote, tempPos);
    
    SetZIndex(activeDragNote, GetNextZIndex());
}

function DragEnd(e) {
        // If you're not holding a note, return.
    if (activeDragNote === null) return;
    e.preventDefault();

    activeDragNote.initialX = activeDragNote.currentX;
    activeDragNote.initialY = activeDragNote.currentY;

    let task = GetTaskFromNote(activeDragNote);
    let position = GetNotePosition(activeDragNote, container);
    StorePositionDataInTask(task, position.left, position.top);

    if (aboveTrashCan) {
        
        if (activeDragNote.readyToBeDeleted) {
            DeleteNote(activeDragNote);
            return;
        }
        if (!requireWaitingUntilDeletionAnimationIsComplete) {
            activeDragNote.DeleteAtEndOfAnimation = true;
            // return;
        } 


        else if (requireWaitingUntilDeletionAnimationIsComplete) {
            ResetNoteStyling(activeDragNote);
            // return;
        }
    }
    if (aboveApprovalBox) {
        if (activeDragNote.readyToBeApproved) {
            ApproveNote(activeDragNote);
            return;
        } 

        if (!requireWaitingUntilApprovalAnimationIsComplete) {
            activeDragNote.ApproveAtEndOfAnimation = true;
            // return;
        } 
        
        if (requireWaitingUntilApprovalAnimationIsComplete) {
            ResetNoteStyling(activeDragNote);
            // return;
        } 
    }

    activeDragNote = null;
}

function Drag(e) {
   
    // If you're "dragging" (ie. moving the mouse) and you're not holding a note, return.
    if (activeDragNote === null) return;
    // console.log(GetMousePosition(e));

    e.preventDefault();

    aboveTrashCan = CheckIfAboveTrashCan(e)
    aboveApprovalBox = CheckIfAboveApprovalBox(e);
    if (aboveTrashCan) {
            // Do not move the note if you're over the trashCan. This is to ensure the animation moves smoothly
        AnimateNotePreDeletion(activeDragNote, 250);
        return;
    }
    if (aboveApprovalBox) {
            // Do not move the note if you're over the Approval Box. This is to ensure the animation moves smoothly
        animateNotePreApproval(activeDragNote, 500);
        return;
    }
    if (activeDragNote.currentlyAnimating) {
        ResetNoteStyling(activeDragNote);
    }
    let pos = GetNotePosWithEvent(activeDragNote, e);
    SetNotePosition(activeDragNote, pos.x, pos.y);
}

function SetNoteDefaultPositionValues(note, pos) {
    if (!note.xOffset) {
        note.xOffset = 0;
    }
    if (!note.yOffset) {
        note.yOffset = 0;
    }
    note.initialX = pos.x - note.xOffset;
    note.initialY = pos.y - note.yOffset;
}
/**
 * Set the current position variables (not the actual positions) to be the difference between where you clicked and where you started dragging
 */
function GetNotePosWithEvent(note, e) {

    let mousePos = GetMousePosition(e);

    let tempNotePos = GetNotePos(note, mousePos.x, mousePos.y);

    // return { x: tempNotePos.x, y: tempNotePos.y };
    return { x: tempNotePos.x, y: tempNotePos.y };
}

function GetNotePos(note, xPos, yPos) {
    let currentX, currentY;
    currentX = xPos - note.initialX;
    currentY = yPos - note.initialY;

    return {x: currentX, y: currentY };
}

function SetNotePosition(note, xPos, yPos) {

    note.currentX = xPos;
    note.currentY = yPos;

    // Set the new offSet to be where it currently sits.
    // This is used to accurately place the div where you want it.
    note.xOffset = note.currentX;
    note.yOffset = note.currentY;
    SetTranslate(note.currentX, note.currentY, note);
}

/**
 * If you move the note into the trash can, but then change your mind, I want the styling to return to what it was prior.
 * @param {note} note DOM element for the note Div
 * @param {event} e Event from the eventhandler
 */
function ResetNoteStyling(note) {
    var jqnote = $(note);
    note.currentlyAnimating = false;
    let oldStyle = jqnote.attr("oldStyle");
    jqnote.removeAttr("oldStyle");
    jqnote.attr("style", oldStyle);
    jqnote.stop();
    note.readyToBeDeleted = false;
    note.readyToBeApproved = false;
}

function SetZIndex(item, index) {
    item.style.zIndex = index;
}

function SetTranslate(xPos, yPos, el) {
    el.style.transform = "translate(" + xPos + "px, " + yPos + "px)";
}

// Thanks to https://www.kirupa.com/html5/drag.htm for the "boilerplate"

function GetPosition(mousePos, containerString) {
    // TODO: Low-Medium Add touch support

    let offset = $(containerString).offset();

    let vector2Offset = {
        left: mousePos.x - offset.left,
        top: mousePos.y - offset.top
    }
    return vector2Offset;
}


function GetNotePosition(note) {

    let matrix = $(note).css('transform');
    let newMatrix = decodeMatrix(matrix);

    let newPos = {
        left: newMatrix[4],
        top: newMatrix[5]
    }
    return newPos;
}

/**
 * Utilizes the browser cross-compatability of jquery to accurately check if it really is left I'm clicking, 
 * as some browsers might use 1 = left, while others use 0 = left (0 should clearly be 'undefined', or 'no event' in my books)
 */
function IsLeftButton(evt) {
    return evt.which == 1;
}

function CreateNewNoteOnPageWithEvent(task, event) {
    let mousePos = GetMousePosition(event);
    let pos = GetPosition(mousePos, container);
    let newPos = CreateNewNoteOnPage(task, pos);

    // Storing the position on the Task (Should only be called on: Initial creation, and on "DragEnd");
    StorePositionDataInTask(task, newPos.left, newPos.top);
}



let noteNumb = 0;
function noteNumberGenerator(){
    noteNumb ++;
    return noteNumb;
}



function CreateNewNoteOnPage(task, pos) {
    let noteNumber = 0;
    let newDiv = document.createElement("div");
    let newTextarea = document.createElement('textarea');
    newDiv.setAttribute("taskID", task.id);
    container.append(newDiv);
    newDiv.setAttribute("class", "note");
    newDiv.setAttribute("id", "note" + task.id);
    newTextarea.setAttribute("class", "textarea");
    let titleString = "<p class = noteName id = 'note" + task.id + "Name'>" + "Note #" + noteNumberGenerator()  + "</p>";
    $(newTextarea).text(task.name);
    newDiv.innerHTML = titleString;
    newDiv.append(newTextarea);
    if(noteNumber == noteNumber){
        noteNumber ++;
    }

    newDiv.currentlyAnimating = false;
    newDiv.readyToBeDeleted = false;
    newDiv.readyToBeApproved = false;

    // Setting the position


    let left = pos.left - ($(newDiv).width() / 2);
    let top = pos.top - ($(newDiv).height() / 2);
    SetTranslate(left, top, newDiv);
    newDiv.xOffset = left;
    newDiv.yOffset = top;
    
    return {left: left, top: top};
}
function StorePositionDataInTask(task, left, top) {
    task.boardPosition.left = left;
    task.boardPosition.top = top;
}

/**
 * This is used to get the parent 'note' element from a given DOM element (For example a <p>)
 * @param {Element} inputElement gets the parent div element from a given DOM Element
 * @returns parent div element with the class 'note'
 */
function GetNoteDiv(inputElement) {
    let noteDiv = null;

    if (inputElement.className === 'textarea'){
    }

    else if (inputElement.className === 'note') {
        noteDiv = inputElement;
    }
    else if (inputElement.parentElement.className === 'note') {
        noteDiv = inputElement.parentElement;
    }
    return noteDiv;
}


function PlaceAllNotesOnPage() {

    if (incubatorBoard === undefined || incubatorBoard === null) {
        console.error("No incubator board!");
        return;
    }
    if (incubatorBoard.tasks === undefined || incubatorBoard.task === null) {
        console.error("No incubator board tasks!");
        return;
    }

    incubatorBoard.tasks.forEach(noteID => {
        let task = GetTaskFromID(noteID);
        if (task === undefined) return;
        CreateNewNoteOnPage(task, task.boardPosition);
    });
}





// Context Menu

// Trigger action when the contexmenu is about to be shown
$(container).on("contextmenu", function (event) {

    let mousePos = GetMousePosition(event);
    
    // Avoid the real one
    event.preventDefault();
    
    // Show contextmenu
    $(".custom-menu").finish().toggle(100).
    
    // In the right position (the mouse)
    css({
        left: mousePos.x + "px",
        top: mousePos.y + "px"
        
    });
});

// If the document is clicked somewhere
$(document).on("mousedown", function (event) {
    
        // If the clicked element is the menu, return
        
    if ($(event.target).parents(".custom-menu").length > 0) return;

        
        // Hide the menu
    $(".custom-menu").hide(100);
    if (activeRightClickNote !== null) {
        activeRightClickNote = null;
    }
});

// If the menu element(li under 'custom-menu' is clicked
$(".custom-menu li").click(function(event){
    
    // Switch Case on all elements with the attribute 'data-acion'
    switch($(this).attr("data-action")) {   
        
        // A case for each 'data-action'

            // If you click the "New Task" 'data-action', then this will happen..
        case "newTask":
        // var noteIDToString = noteID.to
                // Create a new task with the name corresponding to the currend DateTime // Temporary
            let newTask = CreateAndPushTask("");
                // Add said task(specifically its id) to the incubator Board)
            AddTaskIDToBoard(newTask.id, incubatorBoard);
                // Create a new note on the page with the newly created task as the information (Also bring in the event call in order to know where, on the screen, to place it) 
            CreateNewNoteOnPageWithEvent(newTask, event)
            break;
    }
  
    // Hide it AFTER the action was triggered
    $(".custom-menu").hide(100);
});

// This is to set the note to a variable on right-click, in order to know which note to remove when you click on Delete Task in the context menu.
// as the event in the context menu returns the context menu li instead of the note div
document.addEventListener("mousedown", function(event) {
    let note = GetNoteDiv(event.target);
    if (note === null) return;
    let className = note.className; 
    if (className !== "note" ) {
        return;
    }
    activeRightClickNote = note;
})

function GetIncubatorBoard() {
    
    let tempBoardIndex = boards.findIndex( function(e) {
        return e.name == "Incubator";
    });
    return boards[tempBoardIndex];

}

function GetTaskIDFromNote(note) {
    // turn the note into a jqueryNote instead, and get the taskID attribute from that - I had issues getting the value.
    // note.getAttribute("taskID") did not work
    // note.dataset.taskID did not work


    let taskIDString = $(note).attr("taskid");
    let taskID = parseInt(taskIDString);
    return taskID;
}

function GetTaskFromNote(note) {
    let taskID = GetTaskIDFromNote(note);
    let task = GetTaskFromID(taskID);
    return task;
}

function GetNoteFromTask(task) {
    let note = GetNoteFromTaskID(task.id);
    return note;
}

function GetNoteFromTaskID(taskID) {
    // let task = GetTaskFromID(taskID);
    let note = $(taskid = taskID);

    return note;
}

/**
 * Deletes the note from the DOM and the task from the tasks array. Does not delete the task from the incubator board 'tasks' array however.
 * @param {jquery<HTMLElement>} note 
 */
function DeleteNote(note) {
    let task = GetTaskFromNote(note);
    RemoveTaskFromBoard(incubatorBoard, task);
    DeleteTask(task);
    $(note).remove();
}

function ApproveNote(note) {
    let task = GetTaskFromNote(note);
    MoveTaskFromOneBoardToAnother(incubatorBoard, defaultBoard, task.id);
    $(note).remove();
}


function GetMousePosition(event) {
    let x, y;

    if ( event.type === "mousedown" || event.type === "mouseup" || event.type === "mousemove" || event.type === "contextmenu" || event.type === "click") {
        x = event.pageX;
        y = event.pageY;
    }
    else {
        x = event.touches[0].x;
        y = event.touches[0].y;
    }

    return {x: x, y: y};
}

function CheckIfAboveElement(e, otherEle) {
    let mousePos = GetMousePosition(e);
    let otherElePos = GetJQueryPosition(otherEle);

    // Only returns true if both are true (true + true = true | true + false = false (vice versa) | false + false = false)
    return comparePositions([mousePos.x], otherElePos[0]) && comparePositions([mousePos.y], otherElePos[1]);
}

function CheckIfAboveTrashCan(e) {
    return CheckIfAboveElement(e, trashCan);
}

function CheckIfAboveApprovalBox(e) {
    return CheckIfAboveElement(e, approvalBox);
}

function GetJQueryPosition(element) {
    let pos = element.position();
    let width = element.width();
    let height = element.height();

    return [[pos.left, pos.left + width], [pos.top, pos.top + height]];
}


function comparePositions(pos1, pos2) {
    let r1 = (pos1[0] < pos2[0] ? pos1 : pos2);
    let r2 = (pos1[0] < pos2[0] ? pos2 : pos1);
    let intersecting = (r1[1] > r2[0]) || (r1[0] === r2[0]);
    return intersecting;
}

/**
 * 
 * @param {note} noteEle 
 * @returns {Boolean} if it is already animating, return true
 */
function animateNoteBaseline(noteEle) {
    if (noteEle.currentlyAnimating) return true;
    noteEle.currentlyAnimating = true;
    let jqNote = $(noteEle);
    jqNote.attr("oldStyle", jqNote.attr("style"));
}

/**
 * 
 * @param {jquery<HTMLElement>} element 
 * @param {jquery<HTMLElement>} [relativeTo] Which, if applicable, element to set it relative to - if unset it is relative to parent; 
 */
function GetMiddlePosOfElement(element, relativeTo) {
    let elementPositionData = GetPositionData(element);
    let relativeElementPositionData;
    if (relativeTo !== undefined) {
        relativeElementPositionData = GetPositionDataRelative(relativeTo);
    }
}


function AnimateNotePreDeletion(noteEle, duration) {
    if (animateNoteBaseline(noteEle)) return;

    RelocateToMiddleOfTrashcanBody();

    $(noteEle).animate({
        // transform: "translate(" + xPos + "px, " + yPos + "px)",
        opacity: 0.25
    }, duration, function () {

            // If, at the end of the animation, the 'DeleteAtEndOfAnimation' variable is set (which gets set if you let go of the mouse ontop of the trash can), then delete the note & task.
        if (noteEle.DeleteAtEndOfAnimation) {
            DeleteNote(noteEle);
            return;
        } 
        noteEle.readyToBeDeleted = true;
    });

    function RelocateToMiddleOfTrashcanBody() {
        let trashCanBody = trashCan.children("#trashCanBody");
        
        // let trashCanBody = $("#trashCanBody");

        // let trashCanBodyPositionData = GetPositionDataRelative(trashCanBody, trashCan);
        let trashCanPositionData = GetPositionData(trashCan);

        let xOffset = $(noteEle).width() / 2;
        let yOffset = $(noteEle).height() / 2;

            // You get the position
        let xPos = trashCanPositionData.middle.x - xOffset;
        let yPos = trashCanPositionData.middle.y - yOffset;
        SetNotePosition(noteEle, xPos, yPos);
    }
}
/**
 * 
 * @param {jquery<HTMLElement>} element 
 * @param {jquery<HTMLElement>} [relativeTo] Which, if applicable, element to set it relative to - if unset it is relative to parent; 
 */
function GetMiddlePosOfElement(element, relativeTo) {
    let elementPositionData = GetPositionData(element);
    let relativeElementPositionData;
    if (relativeTo !== undefined) {
        relativeElementPositionData = GetPositionDataRelative(relativeTo);
    }
}


function animateNotePreApproval(noteEle, duration) {
    if (animateNoteBaseline(noteEle)) return;

    RelocateToMiddleOfApprovalBox();
    
    $(noteEle).animate({
        // scale: '-=0.8'
        opacity: 0.25
    }, duration, function () {

            // If, at the end of the animation, the 'ApproveAtEndOfAnimation' variable is set (which gets set if you let go of the mouse ontop of the trash can), then approve the task:
            // Delete the note element, remove the task from the incubator array and push the task into the 'defaultBoard' (which, by default, is the ToDo Board).

        if (noteEle.ApproveAtEndOfAnimation) {
            ApproveNote(noteEle);
            return;
        } 
        noteEle.readyToBeApproved = true;
        noteToApprove = null;
    });

    function RelocateToMiddleOfApprovalBox() {
        let approvalBoxPositionData = GetPositionData(approvalBox);
        let xOffset = $(noteEle).width() / 2;
        let yOffset = $(noteEle).height() / 2;
        // Middle of the approvedBoxBody minus the difference between the start of the body and the end of the body (divided by 2)
        let xPos = approvalBoxPositionData.middle.x - xOffset;
        let yPos = approvalBoxPositionData.middle.y - yOffset;
        SetNotePosition(noteEle, xPos, yPos);
    }
}

/**
 * @param {*} dom jquery DOM element
 * @returns {Number[]} The middle of a DOM element's transform
 */
function GetPositionData(dom) {
    let domPos = GetJQueryPosition(dom);
    let domXArray = domPos[0];
    let domXStart = domXArray[0];
    let domXEnd = domXArray[1];
    let domXDifference = domXEnd - domXStart;
    let domXMiddle = domXStart + (domXDifference / 2);

    let domYArray = domPos[1];
    let domYStart = domYArray[0];
    let domYEnd = domYArray[1];
    let domYDifference = domYEnd - domYStart;
    let domYMiddle = domYStart + (domYDifference / 2);

    let start = {x: domXStart, y: domYStart };
    let end = {x: domXEnd, y: domYEnd };
    let difference = {x: domXDifference, y: domYDifference };
    let middle = {x: domXMiddle, y: domYMiddle };

    return {
        start: start,
        end: end,
        difference: difference,
        middle: middle
    };
}

function GetPositionDataRelative(dom, relDom) {
    let domMiddlePos = GetPositionData(dom);
    let relDomMiddlePos = GetPositionData(relDom);

    let newStart = {
        x: relDomMiddlePos.start.x + domMiddlePos.start.x,
        y: relDomMiddlePos.start.y + domMiddlePos.start.y
    };

    let newEnd = {
        x: relDomMiddlePos.end.x /* + domMiddlePos.end.x */,
        y: relDomMiddlePos.end.y /* + domMiddlePos.end.y*/
    };

    let newDifference = {
        // x: $(dom).width()
        x: newEnd.x - newStart.x,
        y: newEnd.y - newStart.y
        // x: relDomMiddlePos.difference.x + domMiddlePos.difference.x,
        // y: relDomMiddlePos.difference.y + domMiddlePos.difference.y
    };

    let newMiddle = {
        x: newStart.x + ( newDifference.x / 2),
        y: newStart.y + ( newDifference.y / 2)
        // x: relDomMiddlePos.middle.x + domMiddlePos.middle.x,
        // y: relDomMiddlePos.middle.y + domMiddlePos.middle.y
    };

    return {
        start: newStart,
        end: newEnd,
        difference: newDifference,
        middle: newMiddle
    };
}

// https://stackoverflow.com/questions/12783650/convert-matrix-array
function decodeMatrix(matrixValue) {
    let values = matrixValue.split('(')[1];
    values = values.split(')')[0];
    values = values.split(',');
    let a = values[0];
    let b = values[1];
    let c = values[2];
    let d = values[3];
    let scale = Math.sqrt(a * a + b * b);
    let sin = b / scale;
    let angle = Math.round(Math.asin(sin) * (180 / Math.PI));
    return values;
}

PlaceAllNotesOnPage();

function SaveNoteTextToTask(e) {
    let target = e.target;
    let jqTarget = $(target);
    console.log(jqTarget.parent());
    let note = jqTarget.parent();

    let task = GetTaskFromNote(note);
    let text = e.target.value;
    task.name = text;
}



// [???] - Don't actually delete the following lines. (DO DELETE THIS THOUGH!!), as it makes it seem we have fun doing this.

// Fun things -- if this is in the final product.. I did an oopsie
 // min and max included 
 function LimitedRandom(min,max){
    return Math.floor( Math.random() * (max-min+1)+min );
}

function NumberOfIntegersNeededForRandom(min, max, checkNum) {
    let iterations = 0;
    if (checkNum >= max) return "Number you are looking for is higher than the possible value";
    while (LimitedRandom(min, max) !== checkNum) {
        iterations++;
    }
    return "It took: " + iterations.toLocaleString('en') + " iterations to get " + checkNum.toLocaleString('en') + " with the min of " + min.toLocaleString('en') + " and the max of " + max.toLocaleString('en') + ".";
}