import "./scss/main.scss";
$( document ).ready(function() {
    $('#portal-globalnav-collapse').on('show.bs.collapse', function () {
        document.body.classList.add('open-nav-overflow');
        document.documentElement.classList.add('open-nav-overflow');
    })
    $('#portal-globalnav-collapse').on('hidden.bs.collapse', function () {
        document.body.classList.remove('open-nav-overflow');
        document.documentElement.classList.remove('open-nav-overflow');
    })
    // $(':not(div[class*="swiper_"]) + div[class*="swiper_"], * > div[class*="swiper_"]:first-of-type').
    // each(function() {
    //   $(this).
    //       nextUntil(':not(div[class*="swiper_"])').
    //       addBack().
    //       wrapAll('<div class="swiper_items_wrapper" />');
    // });
});