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
    var allSwiper = $('div.swiper')
    for (var i = 0; i < allSwiper.length; i++) {
        if(allSwiper[i].getAttribute("data-nb-results-by-batch") > 1){
            allSwiper[i].swiper.params.spaceBetween=30;
            allSwiper[i].swiper.update();
        }
      }

    var elements = document.getElementsByClassName('see_all')
    for (var i = 0; i < elements.length; i++) {
        elements[i].insertAdjacentHTML('afterbegin', '<span class="circle" aria-hidden="true"><span class="icon arrow"></span></span>');
    }

});

