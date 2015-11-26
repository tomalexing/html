$(document).ready(function () {

     $(window).on('load', function () {
        // PRELOADER
            var preloader = $('#page-preloader'),
                spinner = preloader.find('.spinner');
            
            spinner.fadeOut();
            preloader.delay(350).fadeOut('slow');
            setTimeout(function () {
                $(".head-title-block").addClass('active');
            }, 1000);
        // PRELOADER END
    });

    

    // sections height
        var footerHeight = $('footer').innerHeight();

        $('.main-section').css('height', $(window).height());
        $('body').css('padding-bottom', footerHeight);
    

        $(window).on("resize", function () {
            $('.main-section').css('height', $(window).height());
            $('body').css('padding-bottom', footerHeight);
        });
    // sections height END

    // fix menu
        if ($('body').hasClass('index')) {
            $(window).on("scroll", function () {
                if ($(window).scrollTop() > 200) {
                    $("header.main-header").addClass("_page-scroll");
                } else {
                    $("header.main-header").removeClass("_page-scroll");
                }            
            });
            if ($(window).scrollTop() > 200) {
                $("header.main-header").addClass("_page-scroll");
            } else {
                $("header.main-header").removeClass("_page-scroll");
            }
        } else {
            $("header.main-header").addClass("_page-scroll");
        }

    // fix menu end
    var changeMenu = function(){
        $('.mobile-menu').toggleClass('mobile-menu-open');
        $('.main-header').toggleClass('mobile-header-open');
        $('.main-header').toggleClass('mobile-header');
        $('.mobile-menu-btn').toggleClass('mobile-menu-cross');
    }

    // add mobile menu
    if($(window).width() < 1000) {
        $('.main-menu').addClass('mobile-menu');
        $('.mobile-menu-btn').on('click', changeMenu);
    }

    // end mobile menu
    // footer map open
        $(document).on("click", ".open-map-btn", function () {
            $('.open-map-btn , .close-map-btn').addClass('active');
            $(".map-block").addClass('open_map');
        });
        $(document).on("click", ".close-map-btn", function () {
            $('.open-map-btn , .close-map-btn').removeClass('active');
            $(".map-block").removeClass('open_map');
        });
    // footer map open END


    // footer map
        function initialize() {
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 13,
                disableDefaultUI: true,
                center: {lat: 50.455648, lng: 30.450914}
            });

            var infowindow = new google.maps.InfoWindow({
                content: "<p style='color:#4d4d4d;'>Текст про те як добратись<br> до Платформи від метро і т.п.</p>"
            });


            var marker = new google.maps.Marker({
                position: {lat: 50.455648, lng: 30.450914},
                map: map,
                icon:'../images/map-pin.png'
            });

            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });
        }
        google.maps.event.addDomListener(window, 'load', initialize);
    // footer map END
  

    // MENU SCROLLING
        if($("body").hasClass("index")) {
            $('.navbar-nav a[href*=#]').bind("click", function (e) {
                var anchor = $(this);
                $('.navbar-nav li').removeClass('active');
                $('html, body').stop().animate({
                    scrollTop: $(anchor.attr('href')).offset().top
                }, 500);
                
                // if($(this).parents(".main-menu").is(".mobile-menu, .mobile-menu-open")) {
                //     $(".main-menu").removeClass("mobile-menu-open");
                //     $(".mobile-menu-btn").removeClass("active");
                //     $("html, body").removeClass("no-scroll");
                // }
                
                e.preventDefault();
                return false;
            });

            $("section, footer").waypoint(function (direction) {
                if (direction === "down") {
                    $(".navbar-nav a[href*=#" + this.element.id + "]").parent().addClass('active').siblings().removeClass('active');
                }
            }, {
                offset: "50%"
            });
            
            $("section, footer").waypoint(function (direction) {
                if (direction === "up") {
                    $(".navbar-nav a[href*=#" + this.element.id + "]").parent().addClass('active').siblings().removeClass('active');
                    // if(this.element.id == "home") {
                    //     $(".navbar-nav li").removeClass('active');
                    // }
                }
            }, {
                offset: "-1%"
            });
        }
    // MENU SCROLLING end

    if($("body").hasClass("about")) {
        $('.about-nav a[href*=#]').bind("click", function (e) {
            var anchor = $(this);
            $('.about-nav li').removeClass('active');
            $('html, body').stop().animate({
                scrollTop: $(anchor.attr('href')).offset().top
            }, 500);
            
            e.preventDefault();
            return false;
        });

        $("section, footer").waypoint(function (direction) {
            if (direction === "down") {
                $(".about-nav a[href*=#" + this.element.id + "]").parent().addClass('active').siblings().removeClass('active');
            }
        }, {
            offset: "50%"
        });
        
        $("section, footer").waypoint(function (direction) {
            if (direction === "up") {
                $(".about-nav a[href*=#" + this.element.id + "]").parent().addClass('active').siblings().removeClass('active');
                // if(this.element.id == "history") {
                //     $(".about-nav li").removeClass('active');
                // }
            }
        }, {
            offset: "-1%"
        });
    }

    // slide top and bottom
        $(document).on("click", ".slide-down", function () {
            var slide_num = $(this).parents('section').index() - 1;
            $('html, body').animate({'scrollTop': $('section:eq('+slide_num+')').offset().top},700);
            return false;
        });

        $(document).on("click", ".to-top", function () {
            $('html, body').animate({'scrollTop': 0}, 700);
            return false;
        });
    // slide top and bottom end


    // main block text
        // open
        $(document).on("click", ".hidden_text.item_1 b", function () {
            $(this).addClass('active');
            $(".hidden_text.item_2").css('opacity', 0).slideDown('slow').animate({ opacity: 1 },{ queue: false, duration: 'slow' });
        });
        $(document).on("click", ".hidden_text.item_2 b", function () {
            $(".hidden_text.item_3").slideToggle('500');
        });
        
        // close
        $(document).on("click", ".hidden_text.item_1 b.active", function () {
            $(this).removeClass('active');
            $(".hidden_text.item_2,.hidden_text.item_3").slideUp('300');
        });
    // main block text


    // pricing
        
        var presonNum = 1;

        $(document).on("click", ".pricing-item .add-person.plus", function () {
            
            if (presonNum <= 4) {
                presonNum++;   
                $(".num-person").html(presonNum);
            };
            if (presonNum == 2) {
                $(".sum-price b").html(3400);
            }
            if (presonNum == 3) {
                $(".sum-price b").html(3300);
            }
            if (presonNum == 4) {
                $(".sum-price b").html(3200);
            }
            if (presonNum == 5) {
                $(".sum-price b").html(3100);
            }
        });
        $(document).on("click", ".pricing-item .add-person.minus", function () {
            if (presonNum >= 2) {
                presonNum--;    
                $(".num-person").html(presonNum);
            };
            if (presonNum == 1) {
                $(".sum-price b").html(4200);
            }
            if (presonNum == 2) {
                $(".sum-price b").html(3400);
            }
            if (presonNum == 3) {
                $(".sum-price b").html(3300);
            }
            if (presonNum == 4) {
                $(".sum-price b").html(3200);
            }
        });


    // GALLERY initialize
        if($("body").hasClass("index")) {
            document.getElementById('gallery-list').onclick = function (event) {
                event = event || window.event;
                var target = event.target || event.srcElement,
                    link = target.src ? target.parentNode : target,
                    options = {index: link, event: event},
                    links = this.getElementsByTagName('a');
                blueimp.Gallery(links, options);
            }
         }
    // GALLERY initialize end
    
    //Reserve form validation
        $(document).on("submit", "form#formReservation, form#formReservation-2", function() {
            if(!validation($(this).attr("id"))) {
                //here code if validation is successful
            }
            return false;
        });
    //End reserve form validation
    $('.reserve-popup, .navbar-nav a[href*=#]').on('click',function(){
        var $main_menu = $('.main-menu');
        if( $main_menu.hasClass('mobile-menu-open')){
            changeMenu();
        }
    });

});


function validation (formId) {
    if($('form#'+ formId +' .field-success')[0] ) $('form#'+ formId +' .field-success').remove();
    $('form#'+ formId +' .field-error').remove();
    $('form#'+ formId +' .form-control').removeClass('inputError');
    var hasError = false;
    $('form#'+ formId +' .requiredField').each(function() {
        if(jQuery.trim($(this).val()) == '' || jQuery.trim($(this).val()) == jQuery.trim($(this).attr('placeholder'))){
            $(this).parent().append('<strong class="field-error">This is a required field</strong>');
            $(this).addClass('inputError');
            hasError = true;
        } else {
            if($(this).hasClass('email')) {
                var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                if(!emailReg.test(jQuery.trim($(this).val()))){
                    $(this).parent().append('<strong class="field-error">Please enter a valid email address.</strong>');
                    $(this).addClass('inputError');
                    hasError = true;
                } 
            } else if($(this).hasClass('phone')) {
                var phoneReg = /^\+?[0-9 ]*$/;
                if(!phoneReg.test(jQuery.trim($(this).val()))){
                    $(this).parent().append('<strong class="field-error">Please enter a valid phone number.</strong>');
                    $(this).addClass('inputError');
                    hasError = true;
                } 
            } else if($(this).hasClass('date')) {
                var dateReg = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
                if(!dateReg.test(jQuery.trim($(this).val()))){
                    $(this).parent().append('<strong class="field-error">Please enter a valid date.</strong>');
                    $(this).addClass('inputError');
                    hasError = true;
                } 
            } else if($(this).hasClass('time')) {
                var dateReg = /^[0-9]{2}:[0-9]{2}$/;
                if(!dateReg.test(jQuery.trim($(this).val()))){
                    $(this).parent().append('<strong class="field-error">Please enter a valid time.</strong>');
                    $(this).addClass('inputError');
                    hasError = true;
                } 
            } else if($(this).hasClass('persons')) {
                var personsReg = /^[1-9]{1}[0-9]{0,1}$/;
                if(!personsReg.test(jQuery.trim($(this).val()))){
                    $(this).parent().append('<strong class="field-error">Please enter a valid number of persons.</strong>');
                    $(this).addClass('inputError');
                    hasError = true;
                } 
            }
        }
    });
    
    return hasError;




}