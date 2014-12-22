(function () {
  if (typeof MineSweeper === "undefined") {
    window.MineSweeper = {};
  }

  var View = MineSweeper.View = function ($el) {
    this.$el = $el;
    this.board = new MineSweeper.Board;
    this.render();

  };

  View.prototype.render = function () {
    this.$el.empty();
    this.$el.html(this.board.render());


  }
})();