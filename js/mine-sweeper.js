(function () {
  if (typeof MineSweeper === "undefined") {
    window.MineSweeper = {};
  }

  var Board = MineSweeper.Board = function() {
    this.size = 9
    this.gameboard = buildBoard(this.size, this);
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
    dispenceMines(gameboard);
    return gameboard;
  }

  function dispenceMines(board) {
    _.sample(_.flatten(board), 9).forEach(function(tile) { 
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
    return $board;
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
    x,y = pos;
    return this.gameboard[x][y];
  }

  var Tile = MineSweeper.Tile = function (pos, board) {
    this.pos = pos;
    this.flagged = false;
    this.bomb = false;
    this.revealed = false;
    this.board = board;
    this.$el = $('<div>').addClass('tile')
    this.bindEvents();
  }

  Tile.prototype.bindEvents = function() {
    var tile = this;
    this.$el.mousedown(function(event){
      switch (event.which) {
        case 1:
          console.log('left click:' + tile.pos);
          break;
        case 3:
          console.log('right click:' + tile.pos);
          break;
      }

    })
  }

  Tile.prototype.placeBomb = function(){
    this.bomb = true;
  }

  Tile.prototype.render = function() {
    if (this.flagged) {
      return this.$el.addClass('flagged');
    } else if (this.bomb) {
      return this.$el.addClass('bomb');
    } else if (this.revealed) {
      var count = this.neighborMineCount
      if (count === 0) {
        return this.$el.addClass('empty');
      } else {
        return this.$el.attr( "count", this.neighborMineCount)        
      }
    } else {
      return this.$el.addClass('unchecked');
    }
  }

  Tile.prototype.reveal = function() {
    if (!this.revealed) {
      this.revealed = true;
      if (this.neighborMineCount === 0) {
        this.neighbors().forEach(function(neighbor) {
          neighbor.reveal();
        });
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
    relPos.forEach(function(pos) {
      var actualPos = [this.pos[0] + pos[0], this.pos[1] + pos[1]];
      if (this.board.valid(actualPos)) {
        neighbors.push(this.board.tile(pos));
      }
    })
    return neighbors;
  }


})();