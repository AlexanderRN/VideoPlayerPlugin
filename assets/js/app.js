(function($) {

  var VideoPlayer = function(element, options) {

    var elem = $(element);
    var obj = this;

    var settings = $.extend({
      param: 'defaultValue'
    }, options || {});

    // Public method - can be called from client code
    this.changeContent = function(value) {
      elem.html(value);
    };

    this.openVideo = function(videoPath) {
      var video = '<video class="embed-responsive-item" width="520" height="360" controls>' +
          '<source src="" type="video/mp4">' +
          '</video>';

      elem.html(video);
      elem.find('video').attr("src", videoPath);

      // Causes error.
     // elem.find('video').load();
    }
  };

  $.fn.videoPlayer = function(options) {
    var element = $(this);

    // Return early if this element already has a plugin instance
    if (element.data('videoplayer')) return element.data('videoplayer');

    // pass options to plugin constructor
    var videoplayer = new VideoPlayer(this, options);

    // Store plugin object in this element's data
    element.data('videoplayer', videoplayer);

    return videoplayer;
  };
})(jQuery);