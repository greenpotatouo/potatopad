const draggable = document.querySelector(".draggable")

let isDragging = false;
let cursorOffsetInDraggableX = 0;
let cursorOffsetInDraggableY = 0;

draggable.addEventListener('mousedown', (event) => {
  isDragging = true;
  
  cursorOffsetInDraggableX = event.clientX - draggable.getBoundingClientRect().left;
  cursorOffsetInDraggableY = event.clientY - draggable.getBoundingClientRect().top;
  draggable.style.opacity = '0.8';
});

document.addEventListener('mousemove', (event) => {
  if (!isDragging) return;

  let newX = event.clientX - cursorOffsetInDraggableX;
  let newY = event.clientY - cursorOffsetInDraggableY;

  draggable.style.left = `${newX}px`;
  draggable.style.top = `${newY}px`;
});

document.addEventListener('mouseup', (event) => {
  if (isDragging) {
    isDragging = false;
    draggable.style.opacity = '1';
  }
});