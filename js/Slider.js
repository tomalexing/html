(function (window, TweenMax, $) {
    "use strict";

    var Resto = window.Resto = window.Resto || {};

    var Helper = (function () {

        var ServiceHelper = function () {
            return this;
        }

        ServiceHelper.prototype.getNode = function (target) {
            if (typeof (target) === "string") {
                target = document.querySelectorAll(target);
                if (target.length !== 0) {
                    return target;
                }
            } else if ((target.jquery && target.length !== 0) || arguments[0].nodeType == 1) {
                return target = target;
            }
            return false;
        }

        ServiceHelper.prototype.extendSettings = function (settings, options) {
            if (arguments.length === 0 || typeof arguments !== 'object')
                return;

            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    settings[key] = options[key];
                }
            }
            return settings;
        }

        ServiceHelper.prototype.setType = function (sliderInstance) {
            var type = '',
                    settings = sliderInstance.settings;

            settings.type.split('-').forEach(function (elem) {
                type += elem.charAt(0).toUpperCase() + elem.slice(1);
            });

            if (sliderInstance.SliderDecorator[type] === undefined)
                type = 'DefaultType';

            return sliderInstance.SliderDecorator(type);
        }

        ServiceHelper.prototype.extendObject = function (child, parent) {
            for (var prop in parent) {
                if (!child.hasOwnProperty(prop) && typeof (parent[prop]) !== 'function') {
                    child[prop] = parent[prop];
                }
            }

            child._parent = parent;
        }

        return {
            _service: new ServiceHelper,
        }

    })();

    var Slider = Resto.Slider = function (target, options) {

        this.settings = {
            type: false,
            loop: false,
            autoplay: false,
            time: 5000,
            DRAG_SENSITIVITY: .2,
            SWIPE_SENSITIVITY: .1,
            pagePagination: false,
            dots: false,
            dotsClass: "slider-dots",
            nextArrow: false,
            previousArrow: false,
            navigation: {
                dot: true,
                side: true,
            },
            // events
            onInit: function () {
            },
            onStart: function () {
            },
            onStop: function () {
            },
            onDestroy: function () {
            },
            beforeChange: function () {
            },
            afterChange: function () {
            }
        }

        this._service.extendSettings(this.settings, options);

        this.nodes = {
            $slider: $(),
            $slides: $(),
            $current: $(),
            $next: $(),
            $previous: $(),
            $dots: $(),
            $nextArrow: $(),
            $previousArrow: $(),
        };

        this.data = {
            // BOOLEAN VARS
            canDrag: false,
            isSliding: false,
            isDragging: false,
            direction: null, // {TRUE : previous, FALSE : next}
            // FLOAT NUMBERS
            width: null,
            height: null,
            mouseStart: null,
            mouseX: null,
            pagePosition: 0,
            position: 0,
            timer: null,
            // requestAnimationFrame ID
            anim: null,
            directionAction: {
                true: 'previous',
                false: 'next'
            }
        }

        if (!this.init(target))
            return false;
        
        if (this.settings.autoplay) {
            this.play();
        }

        return this;
    }

    Slider.prototype.init = function (target) {
        this.nodes.$slider = $(target);
        if (!this.nodes.$slider) {
            throw "Could not find target in document";
            return false;
        }
        
        if (this.nodes.$slider.length && this.nodes.$slider.length > 0)
            this.nodes.$slider = $(this.nodes.$slider[0]);

        if (this.nodes.$slider.children().length === 0) {
            throw "Target does not have any child elements";
            return false;
        }

        this.nodes.$body = $('body');
        this.nodes.$slides = this.nodes.$slider.children();

        this.nodes.$current = this.nodes.$slides.first();
        
        this.nodes.$next = this.nodes.$current.next();
        this.nodes.$previous = this.nodes.$current.prev();

        if (this.settings.nextArrow) {
            this.nodes.$nextArrow = $(this.settings.nextArrow);
            this.nodes.$nextArrow.addClass('resto-slider-nextArrow');
        }
        
        if (this.settings.previousArrow) {
            this.nodes.$previousArrow = $(this.settings.previousArrow);

            var arrowClass = 'resto-slider-previousArrow';
            if (!this.settings.loop)
                arrowClass += ' hidden';
            this.nodes.$previousArrow.addClass(arrowClass);
        }

        this.data.width = window.innerWidth;
        this.data.height = window.innerHeight;
        
        if(this.settings.pagePagination) {
            this.next = this.nextPage;
            this.previous = this.previousPage;
        }

        this._type = this._service.setType(this);
        
        if(this.settings.dots === true) {
            this.autoGenerateDots();
        } else if (this.settings.dots !== false) {
            this.nodes.$dots = $(this.settings.dots);
        }

        this._type.init();
        this.initEvent();

        return this;
    }

    Slider.prototype.next = function () {
        if (this.data.isSliding)
            return;
        
        this.data.canDrag = false;
        this.data.position++;

        if (!this.nodes.$slides[this.data.position]) {
            if (!this.settings.loop)
                return;
            this.data.position = 0;
        }

        this.data.isSliding = true;
        this.data.direction = false;

        if(this.settings.dots !== false) {
            this.nodes.$dots.eq(this.data.position).addClass('active').siblings().removeClass('active');
        }

        this._type.next();
    }
    
    Slider.prototype.nextPage = function () {
        if (this.data.isSliding)
            return;
        
        this.data.canDrag = false;
        this.data.pagePosition++;
        
        if (!this.data.pages[this.data.pagePosition]) {
            if (!this.settings.loop)
                return;
            this.data.pagePosition = 0;
        }

        this.data.isSliding = true;
        this.data.direction = false;

        if(this.settings.dots !== false) {
            this.nodes.$dots.eq(this.data.pagePosition).addClass('active').siblings().removeClass('active');
        }

        this._type.nextPage();
    }
    
    Slider.prototype.previous = function () {
        if (this.data.isSliding)
            return;
        
        this.data.canDrag = false;
        this.data.position--;

        if (!this.nodes.$slides[this.data.position]) {
            if (!this.settings.loop)
                return;
            this.data.position = this.nodes.$slides.length - 1;
        }

        this.data.isSliding = true;
        this.data.direction = false;
        
        if(this.settings.dots !== false) {
            this.nodes.$dots.eq(this.data.position).addClass('active').siblings().removeClass('active');
        }
        
        this._type.previous();
    }
    
    Slider.prototype.previousPage = function () {
        if (this.data.isSliding)
            return;
        
        this.data.canDrag = false;
        this.data.pagePosition--;
        
        if (!this.data.pages[this.data.pagePosition]) {
            if (!this.settings.loop)
                return;
            this.data.pagePosition = this.data.pages.length - 1;
        }

        this.data.isSliding = true;
        this.data.direction = false;
        
        if(this.settings.dots !== false) {
            this.nodes.$dots.eq(this.data.pagePosition).addClass('active').siblings().removeClass('active');
        }
        
        this._type.previousPage();
    }
    
    Slider.prototype.slideTo = function (index) {
        if (this.data.isSliding || this.data.isDragging)
            return;
        
        this.data.canDrag = false;

        if (this.data.position == index || !this.nodes.$slides[index])
            return;
        
        var $slideToElem = this.nodes.$slides.eq(index);
        $slideToElem.removeClass('next previous');

        this.data.isSliding = true;
        this.data.direction = this.data.position > index;
        this.data.position = index;

        var to = this.data.directionAction[this.data.direction];
        var $to = '$' + to;
        var $current = this.nodes.$current;

        this.nodes.$current = (!this.data.direction) ? this.nodes.$slides.eq(index - 1) : this.nodes.$slides.eq(index + 1);
        this.nodes[$to].removeClass('next previous');
        this.nodes[$to] = $slideToElem;

        this.nodes[$to].addClass(to);

        if(this.settings.dots !== false) {
            this.nodes.$dots.eq(index).addClass('active').siblings().removeClass('active');
        }
        
        this._type.slideTo($to, $current);
    }

    Slider.prototype.slideToPage = function (index) {
        if (this.data.isSliding || this.data.isDragging)
            return;
        
        this.data.canDrag = false;
        
        if (this.data.pagePosition == index || !this.data.pages[index])
            return;

        this.data.pagePosition = index;

        if(this.settings.dots !== false) {
            this.nodes.$dots.eq(index).addClass('active').siblings().removeClass('active');
        }
        
        this._type.slideToPage(index);
    }

    Slider.prototype.setSlides = function ($to) {
        this.nodes.$current.removeClass('current');
        this.nodes.$current = $to;
        this.nodes.$current.addClass('current');
        this.nodes.$next = this.nodes.$current.next();
        this.nodes.$previous = this.nodes.$current.prev();

        if (this.settings.loop) {
            if (this.nodes.$next.length === 0)
                this.nodes.$next = this.nodes.$slides.first();
            else if (this.nodes.$previous.length === 0)
                this.nodes.$previous = this.nodes.$slides.last();
        } else {
            this.nodes.$nextArrow.removeClass('hidden');
            this.nodes.$previousArrow.removeClass('hidden');

            if (this.nodes.$next.length === 0)
                this.nodes.$nextArrow.addClass('hidden');
            if (this.nodes.$previous.length === 0)
                this.nodes.$previousArrow.addClass('hidden');
        }

        this.nodes.$slides.removeClass('next previous');
        this.nodes.$next.addClass('next');
        this.nodes.$previous.addClass('previous');

        this.data.isSliding = false;
        this.data.isDragging = false;

        this._type.setSlides($to);
    }
    
    Slider.prototype.autoGenerateDots = function () {
        this._type.autoGenerateDots();
    }

    Slider.prototype.play = function () {
        var _self = this;
        this.data.timer = setInterval(function(){
            _self.next();
        }, this.settings.time);
    }

    Slider.prototype.stop = function () {
        clearInterval(this.data.timer);
    }

    Slider.prototype.initEvent = function () {
        var _self = this;
        var _sliderScene = this.nodes.$slider.get(0);

        this.nodes.$slider.find('[draggable!=true]').on('dragstart', function (event) {
            event.preventDefault();
        });

        this.nodes.$nextArrow.click(function (event) {
            event.preventDefault();
            _self.next();
        });
        this.nodes.$previousArrow.click(function (event) {
            event.preventDefault();
            _self.previous();
        });
        _sliderScene.addEventListener('mouseenter', function(){
            _self.stop();
        });
        _sliderScene.addEventListener('mouseleave', function(){
            if(_self.settings.autoplay)
                _self.play();     
        });
    }

    // extend helper class
    Slider.prototype._service = Helper._service;

    Slider.in = function (target, options) {
        if (arguments.length === 0) {
            return;
        }
        return new Slider(target, options);
    }

    var SliderDecorator = Slider.prototype.SliderDecorator = function (type) {
        var decorator = new this.SliderDecorator[type]();
        this._service.extendObject(decorator, this);
        return decorator;
    }
    
    var InlineMultiSlider = SliderDecorator.DefaultType = SliderDecorator.InlineSlider = function () {
        this.type = 'inline';
        return this;
    }
    
    InlineMultiSlider.prototype.init = function () {
        var nodes = this.nodes;
        this.data.difference = 0;

        nodes.$slides.wrapAll('<div class="inline-multi-slider">');
        nodes.$nodesBody = nodes.$current.parent();
        TweenMax.set(nodes.$nodesBody, {x: 0});

        nodes.$slides.addClass('slide');
        
        this.buildSlider();
        this.nodes.$current = this.data.pages[this.data.pagePosition];
        this.nodes.$next = this.data.pages[this.data.pagePosition + 1];
        if(this.settings.loop) {
            this.nodes.$previous = this.data.pages[this.data.pages.length - 1];
        }
        this.initEvent();
    }

    InlineMultiSlider.prototype.initEvent = function () {
        var _self = this;
        var _sliderScene = this.nodes.$slider.get(0);


        window.addEventListener('resize', function () {

        }, false);

        window.addEventListener('scroll', function (event) {
            if (_self.data.isDragging)
                event.preventDefault();
        }, false);

        _self.nodes.$slides.on('mousedown', function (event) {
            if (_self.data.isSliding || _self.data.isDragging || event.which !== 1)
                return;
            _self.nodes.$current = _self.getDragTarget($(event.target));

            // _self.nodes.$slides.removeClass('current next previous');
            // _self.nodes.$current.addClass('current');
            // _self.nodes.$next = _self.nodes.$current.next();
            // _self.nodes.$next.addClass('next');
            // _self.nodes.$previous = _self.nodes.$current.prev();
            // _self.nodes.$previous.addClass('previous');

            _self.data.mouseStart = event.clientX || event.pageX;
            _self.data.canDrag = true;
        });

        window.addEventListener('mouseup', function (event) {
            cancelAnimationFrame(_self.data.anim);
            _self.data.canDrag = false;
            if (_self.data.isSliding || !_self.data.isDragging)
                return;

            _self.nodes.$body.removeClass('resto-slider-ondrag');

            _self.data.isDragging = false;
            _self.data.difference += _self.data.mouseX - _self.data.mouseStart;

            if (_self.data.difference > 0) {
                _self.data.difference = 0;
            } else if (_self.data.difference < -_self.data.bodyWidth + _self.data.wrapWidth) {
                _self.data.difference = -_self.data.bodyWidth + _self.data.wrapWidth;
            } else
                _self.data.difference = _self.getClosest();
            
            _self.getPosition();
            
            if(_self.settings.dots !== false) {
                _self.nodes.$dots.eq(_self.data.pagePosition).addClass('active').siblings().removeClass('active');
            }
            
            TweenMax.to(_self.nodes.$slides, .5, {x: _self.data.difference, onComplete: function () {
                _self.setSlides();
            }});
        }, false);

        window.addEventListener('mousemove', function (event) {
            _self.data.mouseX = event.clientX || event.pageX;
            if (!_self.data.canDrag)
                return;
            if (!_self.data.isDragging && ((_self.data.mouseX >= _self.data.mouseStart && -_self.data.difference <= 0) || (_self.data.mouseX <= _self.data.mouseStart && -_self.data.difference >= _self.data.bodyWidth - _self.data.wrapWidth)) && !_self.settings.loop) {
                console.log('no slides here mouse');
                return;
            }
            var newDirection = _self.data.mouseX > _self.data.mouseStart;

            if (_self.data.isDragging || _self.data.isSliding) {
                if (newDirection !== _self.data.direction) {
                    _self.data.direction = newDirection;
                }
                return;
            }

            _self.nodes.$body.addClass('resto-slider-ondrag');
            _self.data.direction = newDirection;

            _self.followMouse();

            _self.data.isDragging = true;
        }, false);

        _self.nodes.$slides.on('touchstart', function (event) {
            event = event.originalEvent || event || window.event;
            if (_self.data.isSliding || _self.data.isDragging)
                return;
            _self.nodes.$current = _self.getDragTarget($(event.target));

            _self.nodes.$slides.removeClass('current next previous');
            _self.nodes.$current.addClass('current');
            _self.nodes.$next = _self.nodes.$current.next();
            _self.nodes.$next.addClass('next');
            _self.nodes.$previous = _self.nodes.$current.prev();
            _self.nodes.$previous.addClass('previous');

            _self.data.mouseStart = event.touches[0].clientX || event.touches[0].pageX;
            _self.data.canDrag = true;
        });

        window.addEventListener('touchend', function (event) {
            _self.data.canDrag = false;
            if (_self.data.isSliding || !_self.data.isDragging)
                return;

            _self.nodes.$body.removeClass('resto-slider-ondrag');

            cancelAnimationFrame(_self.data.anim);
            _self.data.isDragging = false;
            _self.data.difference += _self.data.mouseX - _self.data.mouseStart;

            if (_self.data.difference > 0) {
                _self.data.difference = 0;
            } else if (_self.data.difference < -_self.data.bodyWidth + _self.data.wrapWidth) {
                _self.data.difference = -_self.data.bodyWidth + _self.data.wrapWidth;
            } else
                _self.data.difference = _self.getClosest();
            
            _self.getPosition();
            
            if(_self.settings.dots !== false) {
                _self.nodes.$dots.eq(_self.data.pagePosition).addClass('active').siblings().removeClass('active');
            }
            
            TweenMax.to(_self.nodes.$slides, .5, {x: _self.data.difference, onComplete: function () {
                _self.setSlides();
            }});
        }, false);

        window.addEventListener('touchmove', function (event) {
            _self.data.mouseX = event.touches[0].clientX || event.touches[0].pageX;
            if (!_self.data.canDrag)
                return;
            if (!_self.data.isDragging && ((_self.data.mouseX >= _self.data.mouseStart && -_self.data.difference <= 0) || (_self.data.mouseX <= _self.data.mouseStart && -_self.data.difference >= _self.data.bodyWidth - _self.data.wrapWidth)) && !_self.settings.loop) {
                console.log('no slides here mouse');
                return;
            }
            var newDirection = _self.data.mouseX > _self.data.mouseStart;

            if (_self.data.isDragging || _self.data.isSliding) {
                if (newDirection !== _self.data.direction) {
                    _self.data.direction = newDirection;
                }
                return;
            }

            _self.nodes.$body.addClass('resto-slider-ondrag');
            _self.data.direction = newDirection;

            _self.followMouse();

            _self.data.isDragging = true;
        }, false);
    }

    InlineMultiSlider.prototype.slideToPage = function (index) {
        var _self = this;
        this.data.difference = -(_self.data.pages[index].offset);

        TweenMax.to(_self.nodes.$slides, .5, {x: this.data.difference, ease: Power2.easeIn, onComplete: function () {
            _self.setSlides();
        }});
    }
    
    InlineMultiSlider.prototype.getPosition = function () {
        var _self = this;
        this.data.pagePosition = 0;
        
        this.data.pages.forEach(function(item, i, pages) {
            if(item.offset <= -(_self.data.difference)) {
                _self.data.pagePosition = i;
            } else {
                return false;
            }
        });
    }

    InlineMultiSlider.prototype.buildSlider = function () {
        var width = 0;
        this.nodes.$slides.each(function () {
            var slideWidth = $(this).outerWidth();
            width += slideWidth;
            $(this).width($(this).width()).css('display', 'table');
        });
        this.nodes.$nodesBody.width(width);
        this.data.bodyWidth = width;
        this.data.wrapWidth = this.nodes.$nodesBody.parent().width();
        this.getPages();
        if(this.settings.dots !== false) {
            this.autoGenerateGroups();
        }
    }

    InlineMultiSlider.prototype.followMouse = function () {
        var _self = this;
        this.data.anim = requestAnimationFrame(function () {
            var dif = _self.data.mouseX - _self.data.mouseStart;

            if (dif + _self.data.difference < 50 && dif + _self.data.difference + 50 > -_self.data.bodyWidth + _self.data.wrapWidth) {
                TweenMax.to(_self.nodes.$slides, .4, {x: dif + _self.data.difference});
            } else
                TweenMax.to(_self.nodes.$slides, 1, {x: (_self.data.direction) ? 50 : (-_self.data.bodyWidth + _self.data.wrapWidth - 50)});
            _self.followMouse();
        });
    }

    InlineMultiSlider.prototype.getDragTarget = function ($target) {
        if (!$target.hasClass('slide'))
            $target = this.getDragTarget($target.parent());
        return $target;
    }
    
    InlineMultiSlider.prototype.getClosest = function ($target) {
        var offset = (this.data.direction) ? 0 : this.data.wrapWidth,
            position = 0,
            _self = this;

        this.nodes.$slides.each(function () {
            var width = $(this).outerWidth();

            if (-_self.data.difference + offset > position) {
                position += width;
            } else {
                position = (_self.data.direction) ? (-position + width) : (-position + _self.data.wrapWidth);
                return false;
            }
        });

        if (-_self.data.difference + offset <= position)
            position = (_self.data.direction) ? (-position + width) : (-position + _self.data.wrapWidth);
        
        return position;
    }

    InlineMultiSlider.prototype.getPages = function () {
        var allWidth = this.nodes.$slides.length * this.data.wrapWidth,
            offset = 0,
            pageWidth = 0,
            pages = [],
            i = 0,
            _self = this;

        pages[i] = {};
        pages[i].offset = 0;

        this.nodes.$slides.each(function (index) {
            var width = $(this).outerWidth();
            offset += width;
            pageWidth += width;
            pages[i].pageWith = pageWidth;
            pages[i].index = i;

            if (pageWidth >= _self.data.wrapWidth && offset < allWidth) {
                i++;
                pages[i] = {};
                
                if (_self.data.wrapWidth < pageWidth) {
                    pages[i].offset = offset - width;
                    pages[i].pageWith = width;
                    pages[i - 1].pageWith -= width;
                } else {
                    pages[i].offset = offset;
                    pages[i].pageWith = pageWidth;
                }
                pageWidth = 0;
            }
        });

        if (pages[pages.length - 1].pageWith < _self.data.wrapWidth) {
            pages[pages.length - 1].offset = _self.data.bodyWidth - _self.data.wrapWidth;
        }
        
        this.data.pages = pages;
    }
    
    InlineMultiSlider.prototype.autoGenerateDots = function () {
        
    }
    
    InlineMultiSlider.prototype.autoGenerateGroups = function () {
        var pages = this.data.pages,
            ul = document.createElement("ul"),
            _self = this;
        
        ul.className = this.settings.dotsClass;
        pages.forEach(function(item, i, pages) {
            var li = document.createElement("li");
            ul.appendChild(li);
        });
        
        this.nodes.$slider.parent().append(ul);
        this.nodes.$dots = $(ul).find("li");
        this.nodes.$dots.eq(this.data.pagePosition).addClass('active').siblings().removeClass('active');
        
        this.nodes.$dots.each(function (index) {
            this.addEventListener('click', function (event) {
                _self._parent.slideToPage(index);
            }, false);
        });
    }

    InlineMultiSlider.prototype.setSlides = function () {        
        if (!this.settings.loop) {
            this.nodes.$nextArrow.removeClass('hidden');
            this.nodes.$previousArrow.removeClass('hidden');

            if (this.data.pages[this.data.pagePosition + 1] === undefined)
                this.nodes.$nextArrow.addClass('hidden');
            if (this.data.pages[this.data.pagePosition - 1] === undefined)
                this.nodes.$previousArrow.addClass('hidden');
        }

        this.data.isSliding = false;
        this.data.isDragging = false;
    }
    
    InlineMultiSlider.prototype.nextPage = function () {
        var _self = this;
        this.data.difference = -this.data.pages[this.data.pagePosition].offset;

        TweenMax.to(this.nodes.$slides, .7, {x: this.data.difference, ease: Power1.easeOut, onComplete: function () {
            _self.setSlides();
        }});
    }
    
    InlineMultiSlider.prototype.previousPage = function () {
        var _self = this;
        this.data.difference = -this.data.pages[this.data.pagePosition].offset;

        TweenMax.to(this.nodes.$slides, .7, {x: this.data.difference, ease: Power1.easeOut, onComplete: function () {
            _self.setSlides();
        }});
    }

    var AccordionSlider = SliderDecorator.AccordionSlider = function () {
        this.type = 'accordion';

        return this;
    }
    
    AccordionSlider.prototype.init = function () {
        var nodes = this.nodes;

        nodes.$slides.wrapAll('<div class="accordion-slider">');
        if (this.settings.loop) {
            nodes.$previous = nodes.$slides.last();
        }

        nodes.$current.addClass('current');
        nodes.$next.addClass('next');
        nodes.$previous.addClass('previous');
        nodes.$slides.addClass('slide');

        if(this.settings.dots !== false) {
            this.nodes.$dots.eq(this.data.position).addClass('active').siblings().removeClass('active');
        }
        
        this.initEvent();
    }
    
    AccordionSlider.prototype.initEvent = function () {
        var _self = this;
        var _sliderScene = this.nodes.$slider.get(0);

        if(this.settings.dots !== false) {
            this.nodes.$dots.each(function (index) {
                this.addEventListener('click', function (event) {
                    _self._parent.slideTo(index);
                }, false);
            });
        }

        window.addEventListener('load', function () {

        }, false);

        window.addEventListener('resize', function () {

        }, false);

        window.addEventListener('scroll', function (event) {
            if (_self.data.isDragging)
                event.preventDefault();
        }, false);


        _sliderScene.addEventListener('mousedown', function (event) {
            if (_self.data.isSliding || _self.data.isDragging || event.which !== 1)
                return;
            _self.data.mouseStart = event.clientX || event.pageX;
            _self.data.canDrag = true;
        }, false);

        window.addEventListener('mouseup', function (event) {
            _self.data.canDrag = false;
            if (_self.data.isSliding || !_self.data.isDragging)
                return;

            _self.nodes.$body.removeClass('resto-slider-ondrag');
            cancelAnimationFrame(_self.data.anim);
            if (Math.abs(_self.data.mouseStart - _self.data.mouseX) / _self.data.width > _self.settings.DRAG_SENSITIVITY) {
                if (!_self.data.direction)
                    _self._parent.next();
                else
                    _self._parent.previous();
                return;
            }
            _self.resetSlides();
        }, false);

        window.addEventListener('mousemove', function (event) {
            _self.data.mouseX = event.clientX || event.pageX;
            if (!_self.data.canDrag)
                return;
            if (((_self.data.mouseX >= _self.data.mouseStart && !_self.nodes.$slides[_self.data.position - 1]) || (_self.data.mouseX <= _self.data.mouseStart && !_self.nodes.$slides[_self.data.position + 1])) && !_self.settings.loop) {
                console.log('no slides here mouse');
                return;
            }
            
            var newDirection = _self.data.mouseX > _self.data.mouseStart;

            if (_self.data.isDragging || _self.data.isSliding) {
                if (newDirection !== _self.data.direction) {
                    _self.data.direction = newDirection;
                }
                return;
            }

            _self.nodes.$body.addClass('resto-slider-ondrag');
            _self.data.direction = newDirection;

            _self.followMouse();

            _self.data.isDragging = true;
        }, false);

        _sliderScene.addEventListener('touchstart', function (event) {
            if (_self.data.isSliding || _self.data.isDragging)
                return;
            _self.data.mouseStart = event.touches[0].clientX || event.touches[0].pageX;
            _self.data.canDrag = true;
        }, false);

        _sliderScene.addEventListener('touchend', function (event) {
            _self.data.canDrag = false;
            if (_self.data.isSliding || !_self.data.isDragging)
                return;
            
            cancelAnimationFrame(_self.data.anim);
            if (Math.abs(_self.data.mouseStart - _self.data.mouseX) / _self.data.width > _self.settings.DRAG_SENSITIVITY) {
                if (!_self.data.direction)
                    _self._parent.next();
                else
                    _self._parent.previous();
                return;
            }
            _self.resetSlides();
        }, false);

        _sliderScene.addEventListener('touchmove', function (event) {
            _self.data.mouseX = event.touches[0].clientX || event.touches[0].pageX;
            if (Math.abs(_self.data.mouseX - _self.data.mouseStart) > 10)
                event.preventDefault();
            if (!_self.data.canDrag)
                return;

            if (((_self.data.mouseX >= _self.data.mouseStart && !_self.nodes.$slides[_self.data.position - 1]) || (_self.data.mouseX <= _self.data.mouseStart && !_self.nodes.$slides[_self.data.position + 1])) && !_self.settings.loop) {
                console.log('no slides here mouse');
                return;
            }
            
            var newDirection = _self.data.mouseX > _self.data.mouseStart;

            if (_self.data.isDragging || _self.data.isSliding) {
                if (newDirection !== _self.data.direction) {
                    _self.data.direction = newDirection;
                }
                return;
            }
            
            _self.data.direction = newDirection;
            _self.followMouse();

            _self.data.isDragging = true;
        }, false);
    }

    AccordionSlider.prototype.followMouse = function () {
        var _self = this;
        this.data.anim = requestAnimationFrame(function () {
            var dif = _self.data.mouseStart - _self.data.mouseX,
                abs_dif = Math.abs(dif),
                p_dif = abs_dif / _self.data.width,
                currMove = p_dif * 100 + '%',
                moveDistance = -(_self.data.width - abs_dif),
                $slide = _self.nodes.$previous;

            if (!_self.data.direction) {
                currMove = '-' + currMove;
                moveDistance = -moveDistance;
                $slide = _self.nodes.$next;
            }

            TweenMax.set($slide, {x: moveDistance, scale: 1 + 0.02 * p_dif});
            TweenMax.set(_self.nodes.$current, {x: currMove, opacity: 1 - p_dif * 2});
            _self.followMouse();
        });
    }

    AccordionSlider.prototype.next = function () {
        var _self = this;

        TweenMax.to(this.nodes.$next, .7, {scale: 1.02, x: '0%', ease: Power2.easeIn, onComplete: function () {
            TweenMax.to(_self.nodes.$next, .1, {scale: 1, clearProps: "transform"});
            _self._parent.setSlides(_self.nodes.$next);
        }});
        TweenMax.to(this.nodes.$current, .7, {opacity: 0, x: '-40%', ease: Power2.easeOut, clearProps: "transform, opacity"});
    }
    
    AccordionSlider.prototype.previous = function () {
        var _self = this;

        TweenMax.to(this.nodes.$previous, .7, {scale: 1.02, x: '0%', ease: Power2.easeIn, onComplete: function () {
            TweenMax.to(_self.nodes.$previous, .1, {scale: 1, clearProps: "transform"});
            _self._parent.setSlides(_self.nodes.$previous);
        }});
        
        TweenMax.to(this.nodes.$current, .7, {opacity: 0, x: '40%', ease: Power2.easeOut, clearProps: "transform, opacity"});
    }

    AccordionSlider.prototype.slideTo = function ($to, $current) {
        var _self = this;

        TweenMax.to(_self.nodes[$to], .7, {scale: 1.02, x: '0%', ease: Power2.easeIn, onComplete: function () {
            TweenMax.to(_self.nodes[$to], .4, {scale: 1, clearProps: "transform"});
            _self._parent.setSlides(_self.nodes[$to]);
        }});
    
        TweenMax.to($current, .7, {opacity: 0, x: (!this.data.direction) ? '-40%' : '40%', ease: Power2.easeOut, clearProps: "transform, opacity", onComplete: function () {
            $current.removeClass('current');
        }});
    }

    AccordionSlider.prototype.setSlides = function ($to) {

    }
    
    AccordionSlider.prototype.autoGenerateDots = function () {
        var ul = document.createElement("ul");
    
        ul.className = this.settings.dotsClass;
        this.nodes.$slides.each(function () {
            var li = document.createElement("li");
            ul.appendChild(li);
        });
        
        this.nodes.$slider.parent().append(ul);
        this.nodes.$dots = $(ul).find("li");
    }
    
    AccordionSlider.prototype.resetSlides = function () {
        var $slide = (!this.data.direction) ? this.nodes.$next : this.nodes.$previous;
        var _self = this;

        TweenMax.to($slide, .4, {scale: 1, x: (!this.data.direction) ? '100%' : '-100%', ease: Power2.easeIn, clearProps: "transform"});
        TweenMax.to(this.nodes.$current, .4, {opacity: 1, x: '0%', clearProps: "transform, opacity", onComplete: function () {
            _self.data.isDragging = false;
        }});
    }

    var BookSlider = SliderDecorator.BookSlider = function () {
        this.type = 'book';
        return this;
    }
    
    BookSlider.prototype.init = function () {
        var nodes = this.nodes;

        nodes.$slides.wrapAll('<div class="book-slider">');
        if (this.settings.loop) {
            nodes.$previous = nodes.$slides.last();
        }

        nodes.$current.addClass('current');
        nodes.$next.addClass('next');
        nodes.$previous.addClass('previous');
        nodes.$slides.addClass('slide');

        if(this.settings.dots !== false) {
            this.nodes.$dots.eq(this.data.position).addClass('active').siblings().removeClass('active');
        }
        
        this.initEvent();
    }
    
    BookSlider.prototype.initEvent = function () {
        var _self = this;
        var _sliderScene = this.nodes.$slider.get(0);

        window.addEventListener('load', function () {
            
        }, false);

        if(this.settings.dots !== false) {
            this.nodes.$dots.each(function (index) {
                this.addEventListener('click', function (event) {
                    _self._parent.slideTo(index);
                }, false);
            });
        }

        window.addEventListener('resize', function () {

        }, false);

        _sliderScene.addEventListener('touchstart', function (event) {
            if (_self.data.isSliding)
                return;
            _self.data.mouseStart = event.touches[0].clientX || event.touches[0].pageX;
        }, false);

        _sliderScene.addEventListener('touchend', function (event) {
            if (_self.data.isSliding)
                return;

            if (Math.abs(_self.data.mouseStart - _self.data.mouseX) / _self.data.width > _self.settings.SWIPE_SENSITIVITY) {
                _self.data.direction = _self.data.mouseX > _self.data.mouseStart;
                if (!_self.data.direction)
                    _self._parent.next();
                else
                    _self._parent.previous();
                return;
            }
        }, false);

        _sliderScene.addEventListener('touchmove', function (event) {
            _self.data.mouseX = event.touches[0].clientX || event.touches[0].pageX;
        }, false);
    }

    BookSlider.prototype.next = function () {
        var _self = this;

        TweenMax.to(this.nodes.$next, .8, {scale: 1, opacity: 1, clearProps: "transform, opacity", ease: Power1.easeIn, onComplete: function () {
            _self._parent.setSlides(_self.nodes.$next);
        }});
        TweenMax.to(this.nodes.$current.children().first(), .8, {opacity: .9, x: '200%', ease: Power2.easeIn, clearProps: "transform, opacity"});
        TweenMax.to(this.nodes.$current.children().last(), .8, {opacity: .9, x: '100%', ease: Power2.easeIn, clearProps: "transform, opacity"});
    }
    
    BookSlider.prototype.previous = function () {
        var _self = this;

        TweenMax.to(this.nodes.$previous, .8, {scale: 1, opacity: 1, clearProps: "transform, opacity", ease: Power1.easeIn, onComplete: function () {
            _self._parent.setSlides(_self.nodes.$previous);
        }});
        TweenMax.to(this.nodes.$current.children().first(), .8, {opacity: .9, x: '-100%', ease: Power2.easeIn, clearProps: "transform, opacity"});
        TweenMax.to(this.nodes.$current.children().last(), .8, {opacity: .9, x: '-200%', ease: Power2.easeIn, clearProps: "transform, opacity"});
    }

    BookSlider.prototype.slideTo = function ($to, $current) {
        var _self = this;

        TweenMax.to(this.nodes[$to], .8, {scale: 1, opacity: 1, clearProps: "transform, opacity", ease: Power1.easeIn, onComplete: function () {
            _self._parent.setSlides(_self.nodes[$to]);
            $current.removeClass('current');
        }});
        TweenMax.to($current.children().first(), .8, {opacity: .9, x: (!this.data.direction) ? '200%' : '-100%', ease: Power2.easeIn, clearProps: "transform, opacity"});
        TweenMax.to($current.children().last(), .8, {opacity: .9, x: (!this.data.direction) ? '100%' : '-200%', ease: Power2.easeIn, clearProps: "transform, opacity"});
    }

    BookSlider.prototype.setSlides = function ($to) {

    }
    
    BookSlider.prototype.resetSlides = function () {
        var $slide = (!this.data.direction) ? this.nodes.$next : this.nodes.$previous;
        var _self = this;

        TweenMax.to($slide, .4, {scale: 1, x: (!this.data.direction) ? '100%' : '-100%', ease: Power2.easeIn, clearProps: "transform"});
        TweenMax.to(this.nodes.$current, .4, {opacity: 1, x: '0%', clearProps: "transform, opacity", onComplete: function () {
            _self.data.isDragging = false;
        }});
    }
    
    BookSlider.prototype.autoGenerateDots = function () {
        var ul = document.createElement("ul");
    
        ul.className = this.settings.dotsClass;
        this.nodes.$slides.each(function () {
            var li = document.createElement("li");
            ul.appendChild(li);
        });
        
        this.nodes.$slider.parent().append(ul);
        this.nodes.$dots = $(ul).find("li");
    }
})(window, TweenMax, $);