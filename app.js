const canvas = document.getElementById("canvas");
const restartBtn = document.querySelector(".btn-restart");
const rowsCounter = document.querySelector("#rowInput");
const colsCounter = document.querySelector("#colInput");
const menu = document.querySelector(".toggle-menu");
const gallery = document.querySelector(".images-container");
const gameContainer = document.querySelector(".canvas-container");

window.addEventListener("resize", resizeCanvas, false);

resizeCanvas();

function resizeCanvas() {
  canvas.width = window.innerWidth * 0.85;
  canvas.height = window.innerHeight * 0.75;
}
ctx = canvas.getContext("2d");

class Box {
  constructor(
    img,
    row,
    col,
    rowWidth,
    colWidth,
    imgWidth,
    imgHeight,
    ctx,
    isRedRectangle = false
  ) {
    this.img = img;
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
      this.img,
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
  asyncImageLoader(url) {
    return new Promise((resolve, reject) => {
      var image = new Image();
      image.src = url;
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("could not load image"));
    });
  }

  async restartGame(src, rows, cols) {
    this.rowCount = rows;
    this.colCount = cols;
    this.currentX = 0;
    this.currentY = 0;
    this.img = await this.asyncImageLoader(src);
    this.ctx.drawImage(
      this.img,
      0,
      0,
      this.img.width,
      this.img.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    this.boxes = [];
    for (let i = 0; i < this.rowCount; i++) {
      this.boxes.push([]);
      for (let j = 0; j < this.colCount; j++) {
        this.boxes[i].push(
          new Box(
            this.img,
            i,
            j,
            canvas.width / this.rowCount,
            canvas.height / this.colCount,
            this.img.width / this.rowCount,
            this.img.height / this.colCount,
            this.ctx
          )
        );
      }
    }
    this.shuffle();
    this.play(-1, -1);
  }

  resize() {
    this.maxWidth = canvas.width;
    this.maxHeight = canvas.height;
    for (let i = 0; i < this.rowCount; i++) {
      for (let j = 0; j < this.colCount; j++) {
        this.boxes[i][j].rowWidth = canvas.width / this.rowCount;
        this.boxes[i][j].colWidth = canvas.height / this.colCount;
      }
    }
    this.play(-1, -1);
  }

  constructor(canvas, source) {
    this.ctx = canvas.getContext("2d");
    this.currentX = 0;
    this.currentY = 0;
    this.restartGame(source, 4, 4);
  }

  // shuffle the boxes
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

  // hover an item
  play(x, y) {
    for (let i = 0; i < this.rowCount; i++) {
      for (let j = 0; j < this.colCount; j++) {
        this.boxes[i][j].checkCoordinates(x, y, this.currentX, this.currentY);
      }
    }
  }

  //check win condition
  checkWinCondition() {
    for (let i = 0; i < this.rowCount; i++) {
      for (let j = 0; j < this.colCount; j++) {
        const box = this.boxes[i][j];
        if (box.row !== box.imgRow || box.col !== box.imgCol) return false;
      }
    }
    this.restartGame(this.img.src, this.rowCount, this.colCount);  
    return true;
  }

  // click hovered box
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
          this.checkWinCondition();
          return;
        }
      }
    }
  }
}

let currentImageSource = "img/img2.jpg";

const game = new Game(canvas, "img/img2.jpg");
rowsCounter.value = 4;
colsCounter.value = 4;
canvas.addEventListener("mousemove", (event) =>
  game.play(event.offsetX, event.offsetY)
);
canvas.addEventListener("click", (event) =>
  game.click(event.offsetX, event.offsetY)
);
canvas.addEventListener("mouseout", () => game.play(-1, -1));

const restartGame = (source, cols, rows) => {
  game.restartGame(source, cols, rows);
};

window.addEventListener(
  "resize",
  () => {
    game.resize();
  },
  false
);

restartBtn.addEventListener("click", () => {
  restartGame(currentImageSource, rowsCounter.value, colsCounter.value);
});

toggleGalleryList = () => {
  gallery.classList.toggle("disabled");
  gameContainer.classList.toggle("disabled");
};

menu.addEventListener("click", toggleGalleryList);

for (let i = 1; i <= 19; i++) {
  const img = document.createElement("img");
  img.src = `img/gallery/${i}.jpg`;
  img.classList.add("gallery__img");
  gallery.appendChild(img);
  img.addEventListener("click", () => {
    currentImageSource = img.src;
    restartGame(img.src, rowsCounter.value, colsCounter.value);
    toggleGalleryList();
  });
}
