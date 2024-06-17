import "./tween-max";
import "./scss/main.scss";
import Rellax from './rellax.min.js';
import lottie from 'lottie-web';
import { DotLottie } from '@lottiefiles/dotlottie-web';

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
        // var rellax = new Rellax('.hero-img', {
        //     speed: 2,
        //     center: false,
        //     wrapper: null,
        //     round: true,
        //     vertical: true,
        //     horizontal: true
        //   });
        
        // Mouse parallax
        var request = null;
        var mouse = { x: 0, y: 0 };
        var cx = window.innerWidth / 2;
        var cy = window.innerHeight / 2;
    
        if($( "body" ).hasClass( "portaltype-imio-smartweb-portalpage" )){
            document.querySelector('.portaltype-imio-smartweb-portalpage').addEventListener('mousemove', function(event) {
            mouse.x = event.pageX;
            mouse.y = event.pageY;
            cancelAnimationFrame(request);
            request = requestAnimationFrame(update);
        });
        }
    
        function update() {
            var dx = mouse.x - cx;
            var dy = mouse.y - cy;
            var tiltx = (dy / cy );
            var tilty = - (dx / cx);
            TweenMax.to(".bubble-svg-green", 1, {x:tilty*13, y:tiltx*5, rotation:0.01, ease:Power1.easeOut});
            TweenMax.to(".bubble-svg-blue", 1, {x:-tilty*25, y:-tiltx*10, rotation:0.01, ease:Power1.easeOut});
            TweenMax.to(".bubble-svg-pink", 1, {x:-tilty*4, y:-tiltx*3, rotation:0.01, ease:Power1.easeOut});
        }
    
        window.addEventListener('resize', function(event){
        window.innerWidth / 2;
        window.innerHeight / 2;
        });

        let canvasSoloChild = document.querySelector('#testcanvas');

        const soloChild = new DotLottie({
          autoplay: true,
          loop: true,
          renderer: 'svg',
          canvas: canvasSoloChild,
          src: "https://lottie.host/4db68bbd-31f6-4cd8-84eb-189de081159a/IGmMCqhzpt.lottie", // or .json file
        });

        //  launch on hover

        // $("#dotlottie-canvas").mouseenter(function(){
        //     console.log("entre");
        //     dotLottie.play();
        // });
        // $("#dotlottie-canvas").mouseleave(function(){
        //     console.log("sortie");
        //     dotLottie.pause();
        // });

        // const soloChild = new DotLottie({
        //     autoplay: true,
        //     loop: true,
        //     canvas: canvasSoloChild,
        //     src: "./Plone/ressources-graphiques-ne-jamais-toucher/hero-anim/solo-child-lottie"
        // });


});