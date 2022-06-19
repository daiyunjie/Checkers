'use strict';

function createBoard() {
    const board = document.getElementById('board');
    for (let y = 0; y < 8; y++) {
        const row = document.createElement('div');
        row.className = 'row';
        board.appendChild(row);
        for (let x = 0; x < 8; x++) {
            const square = document.createElement('div');
            square.id = x.toFixed() + y.toString();
            square.className = ((x + y) % 2) ? 'bblack' : 'bwhite';
            //Якщо у квадрата повинен бути шматок             
            if ((x + y) % 2 != 0 && y != 3 && y != 4) {
                let img = document.createElement('img');
                if (y < 3) {
                    img.id = 'w' + square.id;
                    img.src = 'Images/white.png';
                } else {
                    img.id = 'b' + square.id;
                    img.src = 'Images/black.png';
                }
                img.className = 'piece';
                img.setAttribute('draggable', 'true');
                square.appendChild(img);
            }
            square.setAttribute('draggable', 'false');
            row.appendChild(square);
        }
    }
}

function allowDrop() {
    //Проведіть цільові події на всіх чорних квадратах
    const squares = document.querySelectorAll('.bblack');

    for (const s of squares) {
        s.addEventListener('dragover', dragOver, false);
        s.addEventListener('drop', drop, false);
        s.addEventListener('dragenter', dragEnter, false);
        s.addEventListener('dragleave', dragLeave, false);
    }

    const pieces = document.querySelectorAll('img');

    for (const p of pieces) {
        p.addEventListener('dragstart', dragStart, false);
        p.addEventListener('dragend', dragEnd, false);
    }
}

createBoard();
allowDrop();

function dragOver(e) {
    e.preventDefault();
    // Отримайте елемент img, який перетягується
    const dragID = e.dataTransfer.getData('text');
    const dragPiece = document.getElementById(dragID);
    // Працюйте - якщо ми не зможемо отримати дататрансфер, не робіть
    // Вимкніть цей крок ще, подія краплі вловить це
    if (dragPiece) {
        if (e.target.tagName === 'DIV' &&
            isValidMove(dragPiece, e.target, false)) {
            e.dataTransfer.dropEffect = 'move';
        } else {
            e.dataTransfer.dropEffect = 'none';
        }
    }
}

function dragStart(e) {
    if (e.target.draggable) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text', e.target.id);
        e.target.classList.add('selected');
    }
}

function dragEnd(e) {
    e.target.classList.remove('selected');
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();
    // Отримайте елемент img, який перетягується
    const droppedID = e.dataTransfer.getData('text');
    const droppedPiece = document.getElementById(droppedID);
    if (droppedPiece && e.target.tagName === 'DIV' && isValidMove(droppedPiece, e.target, true)) {
        // Створіть новий img у цільовому місці
        const newPiece = document.createElement('img');
        newPiece.src = droppedPiece.src;
        newPiece.id = droppedPiece.id.substr(0, 1) + e.target.id;
        newPiece.draggable = droppedPiece.draggable;

        if (droppedPiece.draggable) {
            newPiece.classList.add('jumpOnly');
        }
        newPiece.classList.add('piece');
        newPiece.addEventListener('dragstart', dragStart, false);
        newPiece.addEventListener('dragend', dragEnd, false);
        e.target.appendChild(newPiece);

        // Видаліть попереднє зображення
        droppedPiece.parentNode.removeChild(droppedPiece);
        // Видаліть ефект краплі з цільового елемента
        e.target.classList.remove('drop');
        kingMe(newPiece);
    }
}

function dragEnter(e) {
    const dragID = e.dataTransfer.getData('text');
    const dragPiece = document.getElementById(dragID);
    const isDIv = e.target.tagName === 'DIV';

    if (dragPiece && isDIv && isValidMove(dragPiece, e.target, false)) {
        e.target.classList.add('drop');
    }
}

function dragLeave(e) {
    e.target.classList.remove('drop');
}
