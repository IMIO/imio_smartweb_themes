import { DotLottie } from '@lottiefiles/dotlottie-web';
import "./tween-max";
import "./scss/main.scss";
import Rellax from './rellax.min.js';

$( document ).ready(function() {
    $('#portal-globalnav-collapse').on('show.bs.collapse', function () {
        document.body.classList.add('open-nav-overflow');
        document.documentElement.classList.add('open-nav-overflow');
    })
    $('#portal-globalnav-collapse').on('hidden.bs.collapse', function () {
        document.body.classList.remove('open-nav-overflow');
        document.documentElement.classList.remove('open-nav-overflow');
    })

    // For custom slider
    if($('.sectionnews .swiper').length > 0){
        var newsSwiper = $('.sectionnews .swiper')[0].swiper
        newsSwiper.params.spaceBetween=30;
        newsSwiper.params.speed=1000,
        newsSwiper.update();
    }
    if($('.sectionevents .swiper').length > 0){
        var eventsSwiper = $('.sectionevents .swiper')[0].swiper
        eventsSwiper.params.spaceBetween=30;
        eventsSwiper.params.speed=1000,
        eventsSwiper.update();
    }
    
        // // parra
        // var rellax = new Rellax('.hero-img');
        var rellax = new Rellax('.hero-img', {
            speed: 2,
            center: false,
            wrapper: null,
            round: true,
            vertical: true,
            horizontal: true
          });
        
        // Mouse parallax
        // var request = null;
        // var mouse = { x: 0, y: 0 };
        // var cx = window.innerWidth / 2;
        // var cy = window.innerHeight / 2;
    
        // if($( "body" ).hasClass( "portaltype-imio-smartweb-portalpage" )){
        //     document.querySelector('.portaltype-imio-smartweb-portalpage').addEventListener('mousemove', function(event) {
        //     mouse.x = event.pageX;
        //     mouse.y = event.pageY;
        //     cancelAnimationFrame(request);
        //     request = requestAnimationFrame(update);
        // });
        // }
    
        // function update() {
        //     var dx = mouse.x - cx;
        //     var dy = mouse.y - cy;
        //     var tiltx = (dy / cy );
        //     var tilty = - (dx / cx);
        //     TweenMax.to(".home-hero .hero-1", 1, {x:tilty*10, y:tiltx*10, rotation:0.01, ease:Power1.easeOut});
        //     TweenMax.to(".home-hero .hero-2", 1, {x:-tilty*17, y:-tiltx*17, rotation:0.01, ease:Power1.easeOut});
        //     TweenMax.to(".home-hero .hero-3", 1, {x:-tilty*4, y:-tiltx*4, rotation:0.01, ease:Power1.easeOut});
        //     TweenMax.to(".agenda-child .ab-1", 1, {x:tilty*10, y:tiltx*10, rotation:0.01, ease:Power1.easeOut});
        //     TweenMax.to(".agenda-child .ab-2", 1, {x:-tilty*17, y:-tiltx*17, rotation:0.01, ease:Power1.easeOut});
        //     TweenMax.to(".agenda-child .ab-3", 1, {x:-tilty*4, y:-tiltx*4, rotation:0.01, ease:Power1.easeOut});
    
        //     TweenMax.to(".end-1", 1, {x:tilty*20, y:tiltx*-10, rotation:0.01, ease:Power1.easeOut});
        //     TweenMax.to(".end-2", 1, {x:-tilty*30, y:-tiltx*17, rotation:0.01, ease:Power1.easeOut});
        //     TweenMax.to(".end-3", 1, {x:-tilty*40, y:-tiltx*4, rotation:0.01, ease:Power1.easeOut});
        //     // TweenMax.to(".main-homepage .zoom-sur .circle.crl1", 1, {x:tilty*6, y:tiltx*6, rotation:0.01, ease:Power1.easeOut});
        // }
    
        // window.addEventListener('resize', function(event){
        // window.innerWidth / 2;
        // window.innerHeight / 2;
        // });

        let canvas1 = document.querySelector('#dotlottie-canvas')

        //  launch on hover

        // $("#dotlottie-canvas").mouseenter(function(){
        //     console.log("entre");
        //     dotLottie.play();
        // });
        // $("#dotlottie-canvas").mouseleave(function(){
        //     console.log("sortie");
        //     dotLottie.pause();
        // });

        const dotLottie = new DotLottie({
            autoplay: true,
            loop: true,
            canvas: canvas1,
            src: "./Plone/ressources-graphiques-ne-jamais-toucher/hero-anim/data-lottie"
        });

});