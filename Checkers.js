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

function isValidMove(source, target, drop) {
    const startPos = source.id.substr(1, 2);
    const prefix = source.id.substr(0, 1);
    let endPos = target.id;
    if (endPos.length > 2) {
        endPos = endPos.substr(1, 2);
    }
    // Ви не можете потрапити на існуюче місце
    if (startPos === endPos) {
        return false;
    }
    // Ви не можете потрапити на окуповану площу
    if (target.childElementCount !== 0) {
        return false;
    }

    let jumpOnly = false;
    if (source.classList.contains('jumpOnly')) {
        jumpOnly = true;
    }
    const xStart = parseInt(startPos.substr(0, 1));
    const yStart = parseInt(startPos.substr(1, 1));
    const xEnd = parseInt(endPos.substr(0, 1));
    const yEnd = parseInt(endPos.substr(1, 1));
    switch (prefix) {
        // For white pieces
        case 'w':
            if (yEnd <= yStart)
                return false; 
            break;
            // For black pieces
        case 'b':
            if (yEnd >= yStart)
                return false; 
            break;
    }
    if (yStart === yEnd || xStart === xEnd)
        return false; 
    // Не вдається перемістити більше двох пробілів
    if (Math.abs(yEnd - yStart) > 2 || Math.abs(xEnd - xStart) > 2)
        return false;
    if (Math.abs(xEnd - xStart) === 1 && jumpOnly)
        return false;
    let jumped = false;
    if (Math.abs(xEnd - xStart) === 2) {
        const pos = ((xStart + xEnd) / 2).toString() +
            ((yStart + yEnd) / 2).toString();
        const div = document.getElementById(pos);
        if (div.childElementCount === 0)
            return false; 
        const img = div.children[0];
        if (img.id.substr(0, 1).toLowerCase() === prefix.toLowerCase())
            return false; 
        if (drop) {
            div.removeChild(img);
            jumped = true;
        }
    }
    if (drop) {
        enableNextPlayer(source);
        if (jumped) {
            source.draggable = true;
            source.classList.add('jumpOnly'); 
        }
    }
    return true;
}

function kingMe(piece) {
    // Якщо ми вже король, просто поверніться
    if (piece.id.substr(0, 1) === 'W' || piece.id.substr(0, 1) === 'B')
        return;

    let newPiece = '';
    if (piece.id.substr(0, 1) === 'w' && piece.id.substr(2, 1) === '7') {
        newPiece = document.createElement('img');
        newPiece.src = './Images/whiteKing.png';
        newPiece.id = 'W' + piece.id.substr(1, 2);
    }
    if (piece.id.substr(0, 1) === 'b' && piece.id.substr(2, 1) === '0') {
        newPiece = document.createElement('img');
        newPiece.src = './Images/blackKing.png';
        newPiece.id = 'B' + piece.id.substr(1, 2);
    }
    if (newPiece) {
        newPiece.draggable = true;
        newPiece.classList.add('piece');
        newPiece.addEventListener('dragstart', dragStart, false);
        newPiece.addEventListener('dragend', dragEnd, false);
        const parent = piece.parentNode;
        parent.removeChild(piece);
        parent.appendChild(newPiece);
    }
}

function enableNextPlayer(piece) {
    const pieces = document.querySelectorAll('img');
    let i = 0;
    while (i < pieces.length) {
        const p = pieces[i++];
        p.draggable = p.id.substr(0, 1).toUpperCase() !== piece.id.substr(0, 1).toUpperCase();
        p.classList.remove('jumpOnly');
    }
}

function resetGame() {
    const rG = document.getElementById('resetGame');
    rG.onclick = function() {
        return location.reload();
    };
}
resetGame();
