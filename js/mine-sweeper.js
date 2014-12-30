(function () {
  if (typeof MineSweeper === "undefined") {
    window.MineSweeper = {};
  }

  var Board = MineSweeper.Board = function(size) {
    this.size = size;
    this.flags = size;
    this.gameboard = buildBoard(this.size, this);
    this.$readOut = $('<div>')
      .addClass('read-out')
      .append("Remaining flags: " + this.flags);
  }

  function buildBoard (size, board) {
    var gameboard = [];
    for (var i = 0; i < size; i++) {
      var row = [];
      for (var j = 0; j < size; j++) {
        var tile = new Tile([i,j], board);
        row.push(tile);
      }
      gameboard.push(row);
    }
    dispenceMines(gameboard, size);
    return gameboard;
  }

  function dispenceMines(board, size) {
    _.sample(_.flatten(board), size).forEach(function(tile) { /* underscore.js methods */
      tile.placeBomb();
    })
  }

  Board.prototype.render = function() {

    var $board = $('<div>').addClass('board');

    this.gameboard.forEach(function(row, idx) {
      $row = $('<div>').addClass('row');
      $board.append($row);
      row.forEach(function(tile){
        $row.append(tile.render());
      })
    })
    return $('<div>')
             .html(this.$readOut)
             .append($board);
  }

  Board.prototype.valid = function(pos) {
    if (pos[0] <0 || pos[0] >= this.size) {
      return false;
    } else if (pos[1] <0 || pos[1] >= this.size) {
      return false;
    } else {
      return true;
    }
  }

  Board.prototype.tile = function(pos) {
    return this.gameboard[pos[0]][pos[1]];
  }
  
  Board.prototype.showBombs = function() {
    this.gameboard.forEach(function(row){
      row.forEach(function(tile){
        if (tile.bomb) {
          tile.$el.addClass('bomb').removeClass('unchecked');
        }
      })
    })
  }

  var Tile = MineSweeper.Tile = function (pos, board) {
    this.pos = pos;
    this.$el = $('<div>').addClass('tile').addClass('unchecked');
    this.board = board;
    this.bindEvents();
    
    // using boolean instance variables to avoid slow .hasClass() DOM query

    this.flagged = false;  
    this.revealed = false;
    this.bomb = false;
  }

  Tile.prototype.bindEvents = function() {
    var tile = this;
    this.$el.mousedown(function(event){
      switch (event.which) {
        case 1: /* left mouse click */
          if (!tile.flagged) {
            if (tile.bomb) {
              tile.board.showBombs();
            } else {
              tile.reveal();
            }
          }
          break;
        case 3: /* right mouse click */
          tile.toggleFlag();
          break;
      }

    })
  }

  Tile.prototype.toggleFlag = function() {
    if (this.flagged) {
      this.flagged = false;
      this.board.flags += 1;
      this.$el.addClass('unchecked').removeClass('flagged');
    } else if (this.board.flags > 0) {
      this.flagged = true;
      this.board.flags -= 1;
      this.$el.addClass('flagged').removeClass('unchecked');
    }
    this.board.$readOut.html("Remaining flags: " + this.board.flags)
  }

  Tile.prototype.placeBomb = function(){
    this.bomb = true;
  }

  Tile.prototype.render = function() {
    return this.$el;
  }

  Tile.prototype.reveal = function() {
    if (!this.revealed && !this.flagged) {
      this.revealed = true;
      this.$el.removeClass('unchecked')
      var count = this.neighborMineCount();
      if (count === 0) {
        this.$el.addClass('empty')
        this.neighbors().forEach(function(neighbor) {
          neighbor.reveal();  /* recursive depth-first search */
        });
      } else {
        this.$el.addClass('checked');
        this.$el.html(count);
      }
    }
  }

  Tile.prototype.neighborMineCount = function() {
    var count = 0;
    this.neighbors().forEach(function(neighbor) {
      if (neighbor.bomb) {
        count += 1;
      }
    })
    return count
  }

  Tile.prototype.neighbors = function() {
    var relPos = [
      [-1,-1],
      [-1,0],
      [-1,1],
      [0,1],
      [0,-1],
      [1,1],
      [1,0],
      [1,-1]
    ];

    var neighbors = []
    var tile = this;
    relPos.forEach(function(pos) {
      var actualPos = [tile.pos[0] + pos[0], tile.pos[1] + pos[1]];
      if (tile.board.valid(actualPos)) {
        neighbors.push(tile.board.tile(actualPos));
      }
    })
    return neighbors;
  }


})();