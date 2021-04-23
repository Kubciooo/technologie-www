const canvas = document.getElementById("canvas");
const img = document.querySelector("img");

ctx = canvas.getContext("2d");

class Box {
  constructor(row, col, rowWidth, colWidth, imgWidth, imgHeight, ctx, isRedRectangle = false) {
    this.row = row;
    this.col = col;
    this.rowWidth = rowWidth;
    this.colWidth = colWidth;
    this.imgWidth = imgWidth;
    this.imgHeight = imgHeight;
    this.ctx = ctx;
    this.imgRow = row;
    this.imgCol = col;
    this.isRedRectangle = isRedRectangle;
  }
  get rowSpan() {
    return [this.rowWidth * this.row, (this.row + 1) * this.rowWidth];
  }
  get colSpan() {
    return [this.colWidth * this.col, (this.col + 1) * this.colWidth];
  }
  get imgRowSpan() {
    return [this.imgWidth * this.imgRow, (this.imgRow + 1) * this.imgWidth];
  }
  get imgColSpan() {
    return [this.imgHeight * this.imgCol, (this.imgCol + 1) * this.imgHeight];
  }

  isNeighbour = (currX, currY) =>
    (Math.abs(currX - this.row) === 1 && this.col === currY) ||
    (Math.abs(currY - this.col) === 1 && this.row === currX);

  isHovered = (x, y, currX, currY) =>
    this.rowSpan[0] <= x &&
    this.rowSpan[1] >= x &&
    this.colSpan[0] <= y &&
    this.colSpan[1] >= y &&
    this.isNeighbour(currX, currY);

  setCoordinates(row, col) {
    this.row = row;
    this.col = col;
  }

  checkCoordinates(x, y, currX, currY) {
    if (this.isRedRectangle) {
      ctx.fillStyle = "red";
      ctx.fillRect(
        this.rowSpan[0],
        this.colSpan[0],
        this.rowWidth,
        this.colWidth
      );
      return;
    }
    this.ctx.drawImage(
      img,
      this.imgRowSpan[0],
      this.imgColSpan[0],
      this.imgWidth,
      this.imgHeight,
      this.rowSpan[0],
      this.colSpan[0],
      this.rowWidth,
      this.colWidth
    );

    if (this.isHovered(x, y, currX, currY)) {
      ctx.fillStyle = "rgba(255,255,255,.3)";
      ctx.fillRect(
        this.rowSpan[0],
        this.colSpan[0],
        this.rowWidth,
        this.colWidth
      );
    }
  }
}

class Game {
  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.colCount = 4;
    this.rowCount = 4;
    this.maxWidth = canvas.width;
    this.maxHeight = canvas.height;
    this.currentX = 0;
    this.currentY = 0;
    this.boxes = [];
    for (let i = 0; i < this.rowCount; i++) {
      this.boxes.push([]);
      for (let j = 0; j < this.colCount; j++) {
        this.boxes[i].push(
          new Box(
            i,
            j,
            this.maxWidth / this.rowCount,
            this.maxHeight / this.colCount,
            img.width / this.rowCount, 
            img.height / this.colCount,
            this.ctx
          )
        );
      }
    }
  }

  shuffle() {
    this.boxes = this.boxes.sort(() => Math.random() - 0.5);
    for (let i = 0; i < this.rowCount; i++) {
      this.boxes[i] = this.boxes[i].sort(() => Math.random() - 0.5);
    }
    for (let i = 0; i < this.rowCount; i++) {
      for (let j = 0; j < this.colCount; j++) {
        this.boxes[i][j].setCoordinates(i, j);
      }
    }
    this.boxes[0][0].isRedRectangle = true;
  }

  play(x, y) {
    for (let i = 0; i < this.rowCount; i++) {
      for (let j = 0; j < this.colCount; j++) {
        this.boxes[i][j].checkCoordinates(x, y, this.currentX, this.currentY);
      }
    }
  }
  click(x, y) {
    for (let i = 0; i < this.rowCount; i++) {
      for (let j = 0; j < this.colCount; j++) {
        if (this.boxes[i][j].isHovered(x, y, this.currentX, this.currentY)) {
          this.boxes[i][j].setCoordinates(this.currentX, this.currentY);
          this.boxes[this.currentX][this.currentY].setCoordinates(i, j);
          [this.boxes[i][j], this.boxes[this.currentX][this.currentY]] = [
            this.boxes[this.currentX][this.currentY],
            this.boxes[i][j],
          ];
          this.currentX = i;
          this.currentY = j;
          this.play(x, y);
          return;
        }
      }
    }
  }
}

const game = new Game(canvas);
img.onload = function () {
  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
  game.shuffle();
};



canvas.addEventListener("mousemove", (e) => game.play(e.offsetX, e.offsetY));
canvas.addEventListener("click", (e) => game.click(e.offsetX, e.offsetY));
