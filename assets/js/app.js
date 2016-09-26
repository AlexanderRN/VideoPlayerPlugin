(function($) {
  /**
   *
   * @param element - The chosen element to work with
   * @param options - The options to use
   * @constructor
   */
  var VideoPlayer = function(options) {

    this.options = $.extend(true, {}, this.defaults, options);
    this.$el = this.options.$el;
    this.$elements = {};

    var elem = $(options.$el),
        obj = this,
        videoObj,
        video,
        settings = $.extend({
          param: 'defaultValue'
        }, options || {});

    this.init();

    this.createPlaylist = function(videos, videoContainer, playlistContainer) {
      var videos = videos,
          i = 1;

      this.init('playlist', videoContainer);

      $.each(videos, function(index, value) {
        var thumbnail = '<li class="playlist-item"><a><img src="' + value.thumb + '" alt="No Thumbnail" height="100%" width="100%"></a></li>';
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

      videoObj.on('ended', function() {
        var li = elem.find(playlistContainer).find('#playlist li a img'),
            el = li.get(i),
            src = $(el).attr('src'),
            firstLi = li.get(0),
            srcArray;

        if (li.get(i) == undefined) {
          console.log(firstLi);
        } else {
          srcArray = src.split('.');
          elem.find(videoContainer).find('video').attr("src", srcArray[0] + ".mp4");
        }

        video.play();
        i++;
      });

    };

  };

  VideoPlayer.prototype = {

    init: function() {
      this.render();
      this.registerElements();
      this.bindControls();
    },

    $: function(selector, context) {
      context = context || this.$el;

      return $(selector, context);
    },

    registerElements: function() {
      var elements = {
        btnPlay: '.btnPlay',
        fullscreen: '.fullscreen',
        videoPlayer: '.video-player',
        currentTime: '.current',
        duration: '.duration',
        timeBar: '.timeBar',
        muted: '.muted',
        volume: '.volume',
        progressBar: '.progressBar',
        volumeBar: '.volumeBar',
        subtitle: '.subtitle',
        timeTooltip: '.time-tooltip',
        openPlaylist: '.openPlaylist',
        playlist: '.overlayPlaylist',
        volumeValue: '.volume-value'
      };

      $.each(elements, function(key, selector) {
        this.$elements[key] = this.$(selector);
      }.bind(this));
    },

    videoTpl: '<video class="video-player embed-responsive-item" width="100%" height="100%"><source src="" type="video/mp4"><track kind="subtitles" label="English subtitles" src="" default></track></video>',
    extVideoTpl: '<iframe class="video-player" width="555" height="312" src="" frameborder="0" allowfullscreen></iframe>',
    volumeTpl: '<div class="volume-value"></div>',

    render: function() {
      var $video,
          container;

      if ($.isPlainObject(this.options.data.src)) {
        if (this.isLocal(this.options.data.src.path)) {
          $video = $(this.videoTpl);

          $video.attr("src", this.options.data.src.path);
          $video.find('track').attr("src", this.options.data.subtitles);

          this.$el.html($video).append(this.createControls());
          $(this.options.$el).append(this.volumeTpl);
        } else {
          $video = $(this.extVideoTpl);

          $video.attr("src", this.options.data.src.path);
          this.$el.html($video);
        }

      } else if ($.isArray(this.options.data.src)) {
        var videos = this.options.data.src,
            playlist = '<ul id="playlist" style="list-style: none"></ul>',
            overlay = '<div class="overlay"><button class="openPlaylist glyphicon glyphicon-list"></button></div>',
            overlayPlaylist = '<div class="overlayPlaylist"></div>',
            self = this;

        if (this.isLocal(this.options.data.src.path)) {
          $video = $(this.videoTpl);

          $video.attr("src", videos[0].path);
          $video.attr("poster", videos[0].thumb);
          this.$el.html($video).append(this.createControls());
          $(this.options.$el).append(overlay);
          $(this.options.$el).append(this.volumeTpl);
          $(this.options.$el).append(overlayPlaylist);
        }

        $(this.options.$el).find('.overlayPlaylist').append(playlist);

        $.each(videos, function(index, value) {
          if (index == 0) {
            return;
          }
          var thumbnail = '<li class="playlist-item"><a>' + value.title + '<img src="' + value.thumb + '" alt="No Thumbnail" height="100%" width="100%"></a></li>';
          $(self.options.$el).find('#playlist').append(thumbnail);
        });

        $("ul li a img").on('click', function() {
          var src = $(this).attr('src'),
              srcArray = src.split('.');

          $video.attr("src", srcArray[0] + ".mp4");
          $video.attr("poster", src);
          self.$elements.playlist.css({'width': '0%'});
          self.resetPlayer();
        });


      } else {
        alert('There was an error with the options');
      }
      // videoObj = el.find('video');
      // video = videoObj.get(0);
    },

    isLocal: function(path) {
      var r = new RegExp('^(?:[a-z]+:)?//', 'i');

      return !r.test(path);
    },

    createControls: function() {
      var controls,
          optionInput = this.options.data.controls,
          optionArray = optionInput.split(',');


      if (optionInput == null || optionInput == '') {
        controls = '<div class="video-controls">' +
            '<button class="btnPlay glyphicon glyphicon-play"></button>' +
            '<button class="fullscreen glyphicon glyphicon-fullscreen"></button>' +
            '<div class="progressTime">' +
            '<span class="current"></span> / ' +
            '<span class="duration"></span>' +
            '</div>' +
            '<div class="progressBar">' +
            '<div class="bufferBar"></div>' +
            '<div class="timeBar"></div>' +
            '</div>' +
            '<button class="muted glyphicon glyphicon-volume-up" ></button>' +
            '<div class="volumeBar">' +
            '<div class="volume"></div>' +
            '</div>' +
            '</div>';

      } else {
        controls = '<div class="video-controls">';

        if ($.inArray('play', optionArray) >= 0) {
          controls += '<button class="btnPlay glyphicon glyphicon-play"></button>';
        }
        if ($.inArray('fullscreen', optionArray) >= 0) {
          controls += '<button class="fullscreen glyphicon glyphicon-fullscreen"></button>';
        }
        if ($.inArray('progress', optionArray) >= 0) {
          controls += '<div class="progressTime">' +
              '<span class="current"></span> / ' +
              '<span class="duration"></span>' +
              '</div>'
        }
        if ($.inArray('time', optionArray) >= 0) {
          controls += '<div class="progressBar">' +
              '<div class="bufferBar"></div>' +
              '<div class="timeBar"></div>' +
              '<div class="time-tooltip">00:00</div>' +
              '</div>'
        }
        if ($.inArray('volume', optionArray) >= 0) {
          controls +=
              '<button class="muted glyphicon glyphicon-volume-up" ></button>' +
              '<div class="volumeBar">' +
              '<div class="volume"></div>' +
              '</div>'
        }
        if ($.inArray('subtitle', optionArray) >= 0) {
          controls +=
              '<button class="subtitle glyphicon glyphicon-subtitles" ></button>'
        }

      }

      return controls;
    },

    bindControls: function() {
      var self = this;

      this.video = self.$elements.videoPlayer.get(0);

      this.dragTime();

      $(this.$elements.progressBar).on('click', function(e) {
        var x = e.pageX,
            progress = $(this),
            maxduration = self.video.duration, //Video duraiton
            position = x - progress.offset().left, //Click pos
            percentage = 100 * position / progress.width();

        //Check within range
        if (percentage > 100) {
          percentage = 100;
        }
        if (percentage < 0) {
          percentage = 0;
        }

        //Update progress bar and video currenttime
        $(self.$elements.timeBar).css('width', percentage + '%');
        self.video.currentTime = maxduration * percentage / 100;

        if ($(self.$elements.btnPlay).hasClass('glyphicon-repeat')) {
          $(self.$elements.btnPlay).removeClass('glyphicon-repeat');
          $(self.$elements.btnPlay).addClass('glyphicon-play');
        }
      });

      $(this.$elements.volumeBar).on('mousedown', function(e) {
        var x = e.pageX,
            volumeBar = $(this),
            volume = $(this).find('.volume'),
            position = x - volumeBar.offset().left,
            percentage = 100 * position / volumeBar.width();

        if (self.video.muted) {
          // Move method into seperate function so I can call it.
          self.video.muted = false;
        }


        $(self.$elements.volume).css('width', percentage + '%');
        self.video.volume = percentage / 100;
      });

      $(this.$elements.fullscreen).on('click', function() {
        //For Webkit

        self.video.webkitRequestFullscreen();

        //For Firefox
        //video.mozRequestFullScreen();

        return false;
      });

      $(this.$elements.muted).on('click', function() {
        $(this).toggleClass('glyphicon glyphicon-volume-up glyphicon glyphicon-volume-off');

        if (!self.video.muted) {
          $(self.$elements.volume).css('width', 0);
          self.video.muted = true;
        } else {
          var volume = self.$elements.volume,
              volumePercent = self.$elements.videoPlayer.get(0).volume * 100;

          $(self.$elements.volume).css('width', volumePercent + '%');
          self.video.muted = false;
        }
      });

      $(this.$elements.subtitle).on('click', function() {

      });

      $(self.video).on('loadedmetadata', function() {
        self.$elements.currentTime.text("0:00");
        self.$elements.duration.text(self.calculateTime(Math.round(self.video.duration)));
      });

      $(self.video).on('ended', function() {
        self.$elements.btnPlay.removeClass('glyphicon-pause');
        self.$elements.btnPlay.addClass('glyphicon-repeat');
      });

      $(self.video).on('timeupdate', function() {
        var currentPos = self.video.currentTime; //Get currenttime
        var maxduration = self.video.duration; //Get video duration
        var percentage = 100 * currentPos / maxduration; //in %
        $(self.$elements.timeBar).css('width', percentage + '%');
        $(self.$elements.currentTime).text(self.calculateTime(Math.round(self.video.currentTime)));
      });

      $(this.$elements.btnPlay).on('click', function() {
        self.playPause(this);
      });

      var current = 0;
      $(self.video).on('mousewheel', function(e) {
        // Calculate how far percentage there has been scrolled.
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        // Do something with `delta`
        current = current + delta;
        if (current < 0) {
          current = 0;
        }
        if (current > 100) {
          current = 100;
        }

        $(self.$elements.volume).css('width', current + '%');
        self.video.volume = current / 100;

        self.$elements.volumeValue.css('display', 'block');
        if (current == 0) {
          self.$elements.volumeValue.html('<span class="glyphicon glyphicon-volume-off"></span>' + current + '%');
        } else if (current >= 1 && current <= 50) {
          self.$elements.volumeValue.html('<span class="glyphicon glyphicon-volume-down"></span>' + current + '%');
        } else {
          self.$elements.volumeValue.html('<span class="glyphicon glyphicon-volume-up"></span>' + current + '%');
        }


        clearTimeout($.data(this, 'timer'));
        $.data(this, 'timer', setTimeout(function() {
          self.$elements.volumeValue.css('display', 'none');
        }, 250));

        e.preventDefault();
      });

      $(this.$elements.progressBar).on('mouseover', function(e) {
        $(this).on('mousemove', function(e) {
          var x = e.pageX,
              progress = $(this),
              maxduration = self.video.duration, //Video duraiton
              position = x - progress.offset().left, //Click pos
              percentage = 100 * position / progress.width(),
              pos,
              perc,
              time;

          //Check within range
          if (percentage > 100) {
            percentage = 100;
          }
          if (percentage < 0) {
            percentage = 0;
          }

          //Update progress bar and video currenttime
          pos = maxduration * percentage / 100;
          perc = (pos / maxduration) * 100;
          time = (perc / 100) * maxduration;

          $(self.$elements.timeTooltip).css('left', e.offsetX - 10);
          $(self.$elements.timeTooltip).text(self.calculateTime(Math.round(time)));
        });
      });

      $(this.$elements.openPlaylist).on('click', function(e) {
        var playlist = self.$elements.playlist,
            width = playlist.css('width');

        if (width == '' || width == '0px') {
          playlist.css({'width': '30%'});
        } else {
          playlist.css({'width': '0%'});
        }
      });

      var i = 1;
      $(self.video).on('ended', function() {
        var li = $(this.$el).find('#playlist li a img'),
            el = li.get(i),
            src = $(el).attr('src'),
            firstLi = li.get(0),
            srcArray;

        if (li.get(i) == undefined) {
          // console.log(firstLi);
        } else {
          srcArray = src.split('.');
          self.video.attr("src", srcArray[0] + ".mp4");
        }

        self.$elements.btnPlay.removeClass('glyphicon-repeat');
        self.$elements.btnPlay.addClass('glyphicon-pause');
        self.video.play();
        i++;
      });
    },

    resetPlayer: function() {
      this.$elements.timeBar.css({'width': '0%'});
      this.$elements.currentTime.text('0:00');
      this.$elements.btnPlay.removeClass('glyphicon-repeat');
      this.$elements.btnPlay.removeClass('glyphicon-pause');
      this.$elements.btnPlay.addClass('glyphicon-play');
    },

    calculateTime: function(time) {
      var seconds = 0,
          minutes = 0;

      if (time < 10) {
        seconds = '0' + time;
        return minutes + ":" + seconds;
      } else if (time >= 10 && time < 60) {
        seconds = time;
        return minutes + ":" + seconds;
      } else if (time >= 60) {
        minutes = time / 60;

        return minutes + ":" + seconds;
      }
      return minutes + ":" + seconds;
    },

    playPause: function(btn) {
      if ($(btn).hasClass('glyphicon glyphicon-repeat')) {
        $(btn).removeClass('glyphicon glyphicon-repeat');
        $(btn).addClass('glyphicon glyphicon-play');
      }
      $(btn).toggleClass('glyphicon glyphicon-play glyphicon glyphicon-pause');

      if ($(btn).hasClass('glyphicon-repeat')) {
        $(btn).removeClass('glyphicon-repeat');
        $(btn).addClass('glyphicon-play');
      }
      if (this.video.paused) {
        this.video.play();
      }
      else {
        this.video.pause();
      }
      return false;
    },

    dragTime: function() {
      var timeDrag = false, /* Drag status */
          self = this;

      this.$elements.progressBar.mousedown(function(e) {
        timeDrag = true;
        updatebar(e.pageX);
      });
      $(document).mouseup(function(e) {
        if (timeDrag) {
          timeDrag = false;
          updatebar(e.pageX);
        }
      });
      $(document).mousemove(function(e) {
        if (timeDrag) {
          updatebar(e.pageX);
        }
      });

      var updatebar = function(x) {
        var progress = self.$elements.progressBar;
        var maxduration = self.video.duration; //Video duraiton
        var position = x - progress.offset().left; //Click pos
        var percentage = 100 * position / progress.width();

        //Check within range
        if (percentage > 100) {
          percentage = 100;
        }
        if (percentage < 0) {
          percentage = 0;
        }

        //Update progress bar and video currenttime
        self.$elements.timeBar.css('width', percentage + '%');
        self.video.currentTime = maxduration * percentage / 100;
      };
    }
  };

  /**
   *
   * Creates an instance of video player plugin on the object.
   */
  $.fn.videoPlayer = function(options) {
    options.$el = this;

    // pass options to plugin constructor
    var videoplayer = this.data('videoplayer') || new VideoPlayer(options);

    // Store plugin object in this element's data
    this.data('videoplayer', videoplayer);

    return videoplayer;
  };
})
(jQuery);