'use strict';

function createBoard() {
    const board = document.getElementById("board");
    for (let y = 0; y < 8; y++) {
        const row = document.createElement("div");
        row.className = "row";
        board.appendChild(row);
        for (let x = 0; x < 8; x++) {
            const square = document.createElement("div");
            square.id = x.toFixed() + y.toString();
            if ((x + y) % 2) {
                square.className = "bblack";
            } else {
                square.className = "bwhite";
            }
            if ((x + y) % 2 != 0 && y != 3 && y != 4) {
                let img = document.createElement("img");
                if (y < 3) {
                    img.id = "w" + square.id;
                    img.src = "Images/white.png";
                } else {
                    img.id = "b" + square.id;
                    img.src = "Images/black.png";
                }
                img.className = "piece";
                img.setAttribute("draggable", "true");
                square.appendChild(img);
            }
            square.setAttribute("draggable", "false");
            row.appendChild(square);
            square.setAttribute("draggable", "false");
            row.appendChild(square);
        }
    }
}
createBoard();