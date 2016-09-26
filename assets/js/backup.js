(function($) {

  var VideoPlayer = function(element, options) {

    var elem = $(element),
        obj = this,
        settings = $.extend({
          param: 'defaultValue'
        }, options || {});


    /**
     *
     * Opens video with the video path passed as param on the selected jQuery object.
     */
    this.openVideo = function(videoPath) {
      var video = '<video class="embed-responsive-item" width="100%" height="100%" controls>' +
          '<source src="" type="video/mp4">' +
          '</video>';

      elem.html(video);
      elem.find('video').attr("src", videoPath);
    };

    this.createPlaylist = function(videos, videoContainer, playlistContainer) {
      var videos = videos,
          video = '<video class="embed-responsive-item" width="100%" height="100%" controls>' +
              '<source src="" type="video/mp4">' +
              '</video>';

      elem.find(videoContainer).html(video);

      $.each(videos, function(index, value) {
        var thumbnail = '<li><a href="#"><img src="' + value.thumb + '" alt="No Thumbnail" height="100%" width="100%"></a></li>';
        elem.find(playlistContainer).find("#playlist").append(thumbnail);
      });

      elem.find(videoContainer).find('video').attr("src", videos[0].path);
      elem.find(videoContainer).find('video').attr("poster", videos[0].thumb);


      $("ul li a img").on('click', function() {
        var src = $(this).attr('src'),
            srcArray = src.split('.');

        elem.find(videoContainer).find('video').attr("src", srcArray[0] + ".mp4");
        elem.find(videoContainer).find('video').attr("poster", src);
      });
    };
  };

  /**
   *
   * Creates an instance of video player plugin on the object.
   */
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