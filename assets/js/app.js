(function($) {
  /**
   *
   * @param options - user input
   * @constructor of video player
   */
  var VideoPlayer = function(options) {
    this.options = $.extend(true, {}, this.defaults, options);
    this.$el = this.options.$el;
    this.$elements = {};

    this.init();
  };

  /**
   *
   * @type {{init: VideoPlayer.init, $: VideoPlayer.$, registerElements: VideoPlayer.registerElements, videoTpl: string, extVideoTpl: string, volumeTpl: string, playCenterTpl: string, render: VideoPlayer.render, isLocal: VideoPlayer.isLocal, createControls: VideoPlayer.createControls, bindControls: VideoPlayer.bindControls, startBuffer: VideoPlayer.startBuffer, resetPlayer: VideoPlayer.resetPlayer, calculateTime: VideoPlayer.calculateTime, playPause: VideoPlayer.playPause, dragTime: VideoPlayer.dragTime, dragVolume: VideoPlayer.dragVolume}}
   */
  VideoPlayer.prototype = {

    /**
     * Init function starts rendering, registering elements and binding controls.
     */
    init: function() {
      this.render();
      this.registerElements();
      this.bindControls();
    },

    /**
     *
     * @param selector
     * @param context
     * @returns {*|HTMLElement}
     */
    $: function(selector, context) {
      context = context || this.$el;

      return $(selector, context);
    },

    /**
     * Registers elements and saves them.
     */
    registerElements: function() {
      var elements = {
        btnPlay: '.btnPlay',
        fullscreen: '.fullscreen',
        videoPlayer: '.video-player',
        controls: '.video-controls',
        videoContainer: '.videoContainer',
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
        volumeValue: '.volume-value',
        buffer: '.bufferBar',
        btnCenterPlay: '.playCenter',
        playContainer: '.playCont',
        next: '.next'
      };

      $.each(elements, function(key, selector) {
        this.$elements[key] = this.$(selector);
      }.bind(this));
    },

    // Templates for rendering.
    videoTpl: '<video class="video-player embed-responsive-item" width="100%" height="100%"><source src="" type="video/mp4"><track kind="subtitles" label="English subtitles" src="" default></track></video>',
    extVideoTpl: '<iframe class="video-player" width="555" height="312" src="" frameborder="0" allowfullscreen></iframe>',
    volumeTpl: '<div class="volume-value"></div>',
    playCenterTpl: '<div class="playCont"><button class="playCenter fa fa-play"></button></div>',

    /**
     * Render function, created the video player, controls and more.
     */
    render: function() {
      var $video,
          $wrapper,
          $videoContainer,
          $toolbar;

      if ($.isPlainObject(this.options.data.src)) {
        if (this.isLocal(this.options.data.src.path)) {
          $video = $(this.videoTpl);
          $wrapper = $('<div class="wrapper"></div>');
          $videoContainer = $('<div class="videoContainer"></div>');
          $toolbar = $('<div class="toolbar"></div>');

          $video.attr("src", this.options.data.src.path);
          $video.find('track').attr("src", this.options.data.subtitles);

          this.$el.append($wrapper);
          $wrapper.append($videoContainer);
          $wrapper.append($toolbar);

          $videoContainer.append($video);
          $videoContainer.append(this.volumeTpl);
          $videoContainer.append(this.playCenterTpl);
          $toolbar.append(this.createControls());
        } else {
          $video = $(this.extVideoTpl);

          $video.attr("src", this.options.data.src.path);
          this.$el.html($video);
        }

      } else if ($.isArray(this.options.data.src)) {
        var videos = this.options.data.src,
            playlist = '<ul id="playlist" style="list-style: none"></ul>',
            overlay = '<div class="overlay"><button class="openPlaylist fa fa-list"></button></div>',
            playlistWrapper = '<div class="playlistWrapper"></div>',
            overlayPlaylist = '<div class="overlayPlaylist"></div>',
            self = this;

        if (this.isLocal(this.options.data.src.path)) {
          $video = $(this.videoTpl);
          $wrapper = $('<div class="wrapper"></div>');
          $videoContainer = $('<div class="videoContainer"></div>');
          $toolbar = $('<div class="toolbar"></div>');

          $video.attr("src", videos[0].path);
          //$video.attr("poster", videos[0].thumb); // Commented due to sizing.

          // Appending all elements to the selector.
          this.$el.append($wrapper);
          $wrapper.append($videoContainer);
          $wrapper.append($toolbar);

          $videoContainer.append($video);
          $videoContainer.append(this.volumeTpl);
          $videoContainer.append(this.playCenterTpl);
          $toolbar.append(this.createControls());
          $videoContainer.append(overlay);
          $videoContainer.append(playlistWrapper);
          $videoContainer.find('.playlistWrapper').append(overlayPlaylist);
        }

        $videoContainer.find('.overlayPlaylist').append(playlist);

        $.each(videos, function(index, value) {
          /*if (index == 0) {
           return;
           }*/
          var thumbnail = '<li class="playlist-item"><a><img src="' + value.thumb + '" alt="No Thumbnail" height="100%" width="50%"></a><p id="title"> ' + value.title + '</p><p id="description"> ' + value.description + '</p></li>';
          $(self.options.$el).find('#playlist').append(thumbnail);
        });

        $("ul li").on('click', function() {
          var src = $(this).find('img').attr('src'),
              srcArray = src.split('.');

          self.$elements.btnCenterPlay.css('visibility', 'hidden');
          $video.attr("src", srcArray[0] + ".mp4");
          $video.attr("poster", src);
          self.$elements.playlist.css({'width': '0%'});
          self.resetPlayer();
          self.video.play();
          self.$elements.btnPlay.removeClass('fa-play');
          self.$elements.btnPlay.addClass('fa-pause');
        });

        // Fallback if options does not fit the terms.
      } else {
        alert('There was an error with the options');
      }
    },

    /**
     * Checks if video is local or http/external.
     * @param path of video (http or local path)
     * @returns {boolean} - returns true if local
     */
    isLocal: function(path) {
      var r = new RegExp('^(?:[a-z]+:)?//', 'i');

      return !r.test(path);
    },

    /**
     * Creates the controls depending on the user inpt from options.
     * @returns a collected html of controls.
     */
    createControls: function() {
      var controls,
          optionInput = this.options.data.controls,
          optionArray = optionInput.split(',');


      if (optionInput == null || optionInput == '') {
        controls = '<div class="video-controls">' +
            '<div class="progressBar">' +
            '<div class="bufferBar"></div>' +
            '<div class="timeBar"></div>' +
            '</div>' +
            '<button class="btnPlay fa fa-play"></button>' +
            '<button class="fullscreen fa fa-fullscreen"></button>' +
            '<div class="progressTime">' +
            '<span class="current"></span> / ' +
            '<span class="duration"></span>' +
            '</div>' +
            '<div class="volumeBar">' +
            '<div class="volume"></div>' +
            '</div>' +
            '<button class="muted fa fa-volume-up" ></button>' +
            '</div>';

      } else {
        controls = '<div class="video-controls">';

        if ($.inArray('progress', optionArray) >= 0) {
          controls += '<div class="progressBar">' +
              '<div class="bufferBar"></div>' +
              '<div class="timeBar"></div>' +
              '<div class="time-tooltip">00:00</div>' +
              '</div>'
        }
        if ($.inArray('play', optionArray) >= 0) {
          controls += '<button class="btnPlay fa fa-play"></button>';
        }
        if ($.inArray('fullscreen', optionArray) >= 0) {
          controls += '<button class="fullscreen fa fa-expand"></button>';
        }
        if ($.inArray('next', optionArray) >= 0 && $.isArray(this.options.data.src)) {
          controls +=
              '<button class="next fa fa-step-forward"></button>'
        }
        if ($.inArray('time', optionArray) >= 0) {
          controls += '<div class="progressTime">' +
              '<span class="current"></span> / ' +
              '<span class="duration"></span>' +
              '</div>'
        }
        if ($.inArray('volume', optionArray) >= 0) {
          controls +=
              '<div class="volumeBar">' +
              '<div class="volume"></div>' +
              '</div>' +
              '<button class="muted fa fa-volume-up" ></button>'
        }
        if ($.inArray('subtitle', optionArray) >= 0) {
          controls +=
              '<button class="subtitle fa fa-cc" ></button>'
        }

      }

      return controls;
    },

    /**
     * Binds all actions to the controls
     */
    bindControls: function() {
      var self = this;

      this.video = self.$elements.videoPlayer.get(0);

      this.dragTime();
      this.dragVolume();

      $(this.$elements.videoContainer).on('mouseenter', function() {
        $(self.$elements.controls).css('visibility', 'visible');
        $(self.$elements.openPlaylist).css('visibility', 'visible');
      });

      $(this.$el).on('mouseleave', function() {
        if (!self.video.paused) {
          $(self.$elements.controls).css('visibility', 'hidden');
          $(self.$elements.openPlaylist).css('visibility', 'hidden');
          $(self.$elements.playlist).css('width', '0%');
        }
      });

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

      $(this.$elements.fullscreen).on('click', function() {
        //For Webkit

        self.video.webkitRequestFullscreen();

        return false;
      });

      $(this.$elements.muted).on('click', function() {
        $(this).toggleClass('fa fa-volume-up fa fa-volume-off');

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

      // TODO Remove or implement subtitles, currently not a supported feature.
      $(this.$elements.subtitle).on('click', function() {

      });

      var running = false;
      $(this.$elements.playContainer).on('click', function() {
        if (!running) {
          if (!self.video.paused) {
            self.video.pause();
            self.$elements.btnPlay.toggleClass('fa fa-play fa fa-pause');
          }
        }
        running = false;
      });

      $(self.video).on('loadedmetadata', function() {
        self.$elements.currentTime.text("0:00");
        self.$elements.duration.text(self.calculateTime(Math.round(self.video.duration)));
      });

      $(self.video).on('ended', function() {
        self.$elements.btnPlay.toggleClass('fa-pause fa-repeat');
        self.$elements.btnCenterPlay.toggleClass('fa-play fa-repeat');
      });

      $(self.video).on('pause', function() {
        self.$elements.btnCenterPlay.css('visibility', 'visible');
      });

      $(self.video).on('timeupdate', function() {
        var currentPos = self.video.currentTime,
            maxduration = self.video.duration,
            percentage = 100 * currentPos / maxduration;

        self.startBuffer();

        $(self.$elements.timeBar).css('width', percentage + '%');
        $(self.$elements.currentTime).text(self.calculateTime(Math.round(self.video.currentTime)));
      });

      $(this.$elements.btnPlay).on('click', function() {
        self.playPause(this);
      });

      var i = 1;
      $(this.$elements.next).on('click', function() {
        var list = $(self.$el).find('#playlist li'),
            listElem = list.get(i),
            src = $(listElem).find('img').attr('src'),
            srcArray;

        if (!listElem) {
          i = 0;
        } else {
          srcArray = src.split('.');
          $(self.video).attr("src", srcArray[0] + ".mp4");
          self.$elements.btnCenterPlay.css('visibility', 'hidden');
          self.$elements.btnPlay.removeClass('glyphicon-repeat');
          self.$elements.btnPlay.addClass('glyphicon-pause');
          self.video.play();
          i++;
        }

      });

      $(this.$elements.btnCenterPlay).on('click', function() {
        running = true;
        self.playPause(self.$elements.btnPlay);
      });

      var current = 0;
      $(this.$elements.playContainer).on('mousewheel', function(e) {
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
          self.$elements.volumeValue.html('<span class="fa fa-volume-off"></span>' + current + '%');
        } else if (current >= 1 && current <= 50) {
          self.$elements.volumeValue.html('<span class="fa fa-volume-down"></span>' + current + '%');
        } else {
          self.$elements.volumeValue.html('<span class="fa fa-volume-up"></span>' + current + '%');
        }


        clearTimeout($.data(this, 'timer'));
        $.data(this, 'timer', setTimeout(function() {
          self.$elements.volumeValue.css('display', 'none');
        }, 500));

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

      var j = 1;
      $(self.video).on('ended', function() {
        var list = $(self.$el).find('#playlist li'),
            listElem = list.get(j),
            src = $(listElem).find('img').attr('src'),
            srcArray;

        console.log(listElem);

        if (!listElem) {
          j = 0;
        } else {
          srcArray = src.split('.');
          $(self.video).attr("src", srcArray[0] + ".mp4");
          self.$elements.btnCenterPlay.css('visibility', 'hidden');
          self.$elements.btnPlay.removeClass('glyphicon-repeat');
          self.$elements.btnPlay.addClass('glyphicon-pause');
          self.video.play();
          j++;
        }

      });
    },

    /**
     * Starts buffering the player and loads the file.
     */
    startBuffer: function() {
      var maxduration = this.video.duration,
          currentBuffer = this.video.buffered.end(0),
          percentage = 100 * currentBuffer / maxduration;

      this.$elements.buffer.css('width', percentage + '%');

      if (currentBuffer < maxduration) {
        setTimeout(this.startBuffer, 500);
      }
    },

    /**
     * Resets the video player to initial state
     */
    resetPlayer: function() {
      this.$elements.timeBar.css({'width': '0%'});
      this.$elements.currentTime.text('0:00');
      this.$elements.btnPlay.removeClass('glyphicon-repeat');
      this.$elements.btnPlay.removeClass('glyphicon-pause');
      this.$elements.btnPlay.addClass('glyphicon-play');
    },

    /**
     * Calculates time in minutes/seconds from the parameter time, and returns it as a string.
     * @param time
     * @returns {string}
     */
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

    /**
     * Plays or pauses the video, takes the play-button as paramater.
     * @param btn
     * @returns {boolean}
     */
    playPause: function(btn) {
      this.$elements.btnCenterPlay.css('visibility', 'hidden');
      if ($(btn).hasClass('fa fa-repeat')) {
        $(btn).removeClass('fa fa-repeat');
        $(btn).addClass('fa fa-play');
      }
      if (this.$elements.btnCenterPlay.hasClass('fa fa-repeat')) {
        this.$elements.btnCenterPlay.removeClass('fa fa-repeat');
        this.$elements.btnCenterPlay.addClass('fa fa-play');
      }

      $(btn).toggleClass('fa fa-play fa fa-pause');

      if (this.video.paused) {
        this.video.play();
      } else {
        this.video.pause();
      }
      return false;
    },

    /**
     * Checks if the user is dragging the video time and changes it.
     */
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
    },

    /**
     * Checks if the user is dragging the video volume and changes it
     */
    dragVolume: function() {
      var volumeDrag = false, /* Drag status */
          self = this;

      this.$elements.volumeBar.mousedown(function(e) {
        volumeDrag = true;
        updatebar(e.pageX);
      });
      $(document).mouseup(function(e) {
        if (volumeDrag) {
          volumeDrag = false;
          updatebar(e.pageX);
        }
      });
      $(document).mousemove(function(e) {
        if (volumeDrag) {
          updatebar(e.pageX);
        }
      });

      var updatebar = function(x) {
        var volumeBar = self.$elements.volumeBar,
            volume = self.$elements.volume,
            position = x - volumeBar.offset().left, //Click pos
            percentage = 100 * position / volumeBar.width(),
            current = self.video.volume;

        //Check within range
        if (percentage > 100) {
          percentage = 100;
        }
        if (percentage < 0) {
          percentage = 0;
        }

        //Update progress bar and video currenttime
        self.$elements.volumeValue.css('display', 'block');
        if (current * 100 == 0) {
          self.$elements.volumeValue.html('<span class="fa fa-volume-off"></span>' + Math.round(current * 100) + '%');
        } else if (current * 100 >= 1 && current * 100 <= 50) {
          self.$elements.volumeValue.html('<span class="fa fa-volume-down"></span>' + Math.round(current * 100) + '%');
        } else {
          self.$elements.volumeValue.html('<span class="fa fa-volume-up"></span>' + Math.round(current * 100) + '%');
        }

        clearTimeout($.data(this, 'timer'));
        $.data(this, 'timer', setTimeout(function() {
          self.$elements.volumeValue.css('display', 'none');
        }, 500));

        volume.css('width', percentage + '%');
        self.video.volume = percentage / 100;
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