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

    // For custom slider
    // var newsSwiper = $('.sectionnews .swiper')[0].swiper
    // newsSwiper.params.spaceBetween=30;
    // newsSwiper.params.speed=1000,
    // newsSwiper.update();
    // var newsSwiper = $('.sectionevents .swiper')[0].swiper
    // newsSwiper.params.spaceBetween=30;
    // newsSwiper.params.speed=1000,
    // newsSwiper.update();
});