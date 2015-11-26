var Parallax = {
    selectorParallax: '.parallax',
    selectorHeader: '.parallax-header',
    selectorImage: '.parallax-img',
    amount: 0,
    initialized: false,
    start: 0,
    stop: 0,

    initialize: function () {
        var _self = this;

        if (touch && !this.initialized) {
            $(this.selectorHeader).each(function (i, item) {
                var $item   = $(item),
                    $cover  = $item.children(_self.selectorParallax), 
                    $image  = $cover.find('img' + _self.selectorImage);

                $cover.show();
                
                if ($image.length) {
                    var imageWidth  = $image.css('width', 'auto').outerWidth(),
                        imageHeight = $image.outerHeight(),
                        itemHeight  = $item.outerHeight(),
                        scaleX      = windowWidth / imageWidth;
                        scaleY      = (windowHeight > $image.parent().height())?(windowHeight / imageHeight):($image.parent().height() / imageHeight);
                        scale       = Math.max(scaleX, scaleY);
                        newWidth    = parseInt(imageWidth * scale),
                        newHeight   = scale * imageHeight;

                    $image.css({
                        'max-width': 'none',
                        width: newWidth,
                        opacity: 1
                    });

                    $cover.css({
                        top: 0,
                        left: (windowWidth - newWidth) / 2
                    });
                }

                TweenMax.to($cover, .3, {
                    opacity: 1
                });

                $item.css('min-height', windowHeight);
            });

            return;
        }

        this.stop           = documentHeight - windowHeight;
        this.amount         = $('body').data('parallax-speed') || 0.5;
        this.initialized    = true;

        // clean up
        $('.covers').empty();

        $(this.selectorParallax).each(function (i, cover) {
            // grab all the variables we need
            var $cover      = $(cover),
                $item       = $cover.parent(),
                $clone      = $cover.clone().wrap("div" + _self.selectorHeader),
                $cloneImage = $clone.find('img' + _self.selectorImage),
                itemHeight  = $item.outerHeight(),
                itemOffset  = $item.offset(),
                $target     = $cover.children(),
                $cloneTarget = $clone.children(),
                imageWidth  = $target.outerWidth(),
                imageHeight = $target.outerHeight(),
                amount      = _self.amount,

                // we may need to scale the image up or down
                // so we need to find the max scale of both X and Y axis
                scaleX,
                scaleY,
                scale,
                newWidth,
                distance,
                speeds      = {
                    static: 0,
                    slow:   0.25,
                    medium: 0.5,
                    fast:   0.75,
                    fixed:  1
                };

            $cover.removeAttr('style');
            $clone.data('source', $cover).appendTo('.covers').show();
            $clone.css('height', itemHeight);

            // let's see if the user wants different speed for different whateva'
            if (typeof parallax_speeds !== "undefined") {
                $.each(speeds, function(speed, value) {
                    if (typeof parallax_speeds[speed] !== "undefined") {
                        if ($item.is(parallax_speeds[speed])) {
                            amount = value;
                        }
                    }
                });
            }

            scaleX      = windowWidth / imageWidth;
            scaleY      = (itemHeight + (windowHeight - itemHeight) * amount) / imageHeight;
            scale       = Math.max(scaleX, scaleY);
            newWidth    = parseInt(imageWidth * scale);
            distance    = (windowHeight - itemHeight) * amount;

            // if there's a slider we are working with we may have to set the height
            $cloneTarget.css('height', itemHeight + distance);

            // set the new width, the image should have height: auto to scale properly
            $cloneImage.css({
                'width': newWidth,
                'height': 'auto'
            });

            // prepare image / slider timeline
            var parallax = {
                    start:      itemOffset.top - windowHeight - distance / 2,
                    end:        itemOffset.top + itemHeight + distance / 2,
                    timeline:   new TimelineMax({ paused: true })
                },
            // the container timeline
                parallax2 = {
                    start:      0,
                    end:        documentHeight,
                    timeline:   new TimelineMax({ paused: true })
                };

            // move the image for a parallax effect
            parallax.timeline.fromTo($cloneTarget, 1, {
                y: '-=' + itemHeight * amount
            }, {
                y: '+=' + itemHeight * amount * 2,
                ease: Linear.easeNone,
                force3D: true
            });

            // move the container to match scrolling
            parallax2.timeline.fromTo($clone, 1, {
                y: itemOffset.top
            }, {
                y: itemOffset.top - documentHeight,
                ease: Linear.easeNone,
                force3D: true
            });

            // set the parallax info as data attributes on the clone to be used on update
            $clone.data('parallax', parallax).data('parallax2', parallax2);

            // update progress on the timelines to match current scroll position
            _self.update();

            if (_self.initialized) {
                TweenMax.to($clone, .3, {'opacity': 1});
            }
        });
    },

    update: function () {
        if (touch || isIe || latestKnownScrollY > this.stop || latestKnownScrollY < this.start) {
            return;
        }
        $('.covers ' + this.selectorParallax).each(function (i, cover) {
            var $cover      = $(cover),
                parallax    = $cover.data('parallax'),
                parallax2   = $cover.data('parallax2'),
                progress    = (latestKnownScrollY - parallax.start) / (parallax.end - parallax.start),
                progress2   = (latestKnownScrollY - parallax2.start) / (parallax2.end - parallax2.start);

            progress = 0 > progress ? 0 : progress;
            progress = 1 < progress ? 1 : progress;

            progress2 = 0 > progress2 ? 0 : progress2;
            progress2 = 1 < progress2 ? 1 : progress2;

            parallax.timeline.progress(progress);
            parallax2.timeline.progress(progress2);
        });
    }
};