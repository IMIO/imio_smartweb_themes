import "./scss/main.scss";
import "./js/tween-max";

$( document ).ready(function() {
    $('#portal-globalnav-collapse').on('show.bs.collapse', function () {
        document.body.classList.add('open-nav-overflow');
        document.documentElement.classList.add('open-nav-overflow');
    })
    $('#portal-globalnav-collapse').on('hidden.bs.collapse', function () {
        document.body.classList.remove('open-nav-overflow');
        document.documentElement.classList.remove('open-nav-overflow');
    })
    
});



//  bubble


// $( document ).ready(function() {

//     var circleGrey = $('<div class="circle crl1"></div>');
//     var circleYellow = $('<div class="circle crl2"></div>');
//     var circleYellow2 = $('<div class="circle crl2 crl21"></div>');
//     var circleGrey2 = $('<div class="circle crl1"></div>');
    
//     $(".a-la-une .swiper_title").append(circleGrey, circleYellow, circleYellow2);
//     // $(".zoom-sur").append(circleGrey2);

//     // // parra
//     var request = null;
//     var mouse = { x: 0, y: 0 };
//     var cx = window.innerWidth / 2;
//     var cy = window.innerHeight / 2;

//     if($( "body" ).hasClass( "portaltype-imio-smartweb-portalpage" )){
//         document.querySelector('.a-la-une').addEventListener('mousemove', function(event) {
//         mouse.x = event.pageX;
//         mouse.y = event.pageY;
//         cancelAnimationFrame(request);
//         request = requestAnimationFrame(update);
//     });
//     }

//     function update() {
//         var dx = mouse.x - cx;
//         var dy = mouse.y - cy;
//         var tiltx = (dy / cy );
//         var tilty = - (dx / cx);
//         console.log(tilty)
//         TweenMax.to(".swiper-slide-active .circle.crl1", 1, {x:tilty*10, y:tiltx*10, rotation:0.01, ease:Power1.easeOut});
//         TweenMax.to(".swiper-slide-active .circle.crl2", 1, {x:-tilty*17, y:-tiltx*17, rotation:0.01, ease:Power1.easeOut});
//         TweenMax.to(".a-la-une .swiper-slide-active .swiper-image", 1, {x:-tilty*4, y:-tiltx*4, rotation:0.01, ease:Power1.easeOut});
//         // TweenMax.to(".main-homepage .zoom-sur .circle.crl1", 1, {x:tilty*6, y:tiltx*6, rotation:0.01, ease:Power1.easeOut});
//     }

//     window.addEventListener('resize', function(event){
//     window.innerWidth / 2;
//     window.innerHeight / 2;
//     });

// });