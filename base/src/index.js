import "./scss/main.scss";
$(document).ready(function () {
  $("#portal-globalnav-collapse").on("show.bs.collapse", function () {
    document.body.classList.add("open-nav-overflow");
    document.documentElement.classList.add("open-nav-overflow");
  });
  $("#portal-globalnav-collapse").on("hidden.bs.collapse", function () {
    document.body.classList.remove("open-nav-overflow");
    document.documentElement.classList.remove("open-nav-overflow");
  });

  // For custom slider
  // var newsSwiper = $('.sectionnews .swiper')[0].swiper
  // newsSwiper.params.spaceBetween=30;
  // newsSwiper.update();

  // function addElement() {
  //   // create a new div element
  //   const newDiv = document.createElement("div");
  //   newDiv.classList.add('test');

  //   // add the newly created element and its content into the DOM
  //   const currentDiv = $('.swiper-wrapper')
  //   console.log(currentDiv)
  //   document.body.insertBefore(newDiv, currentDiv);
  // }

  // For custom slider

  // if ($('.smartweb_herobanner .swiper').length > 0) {
  //     var newsSwiper = $('.smartweb_herobanner .swiper')[0].swiper
  //     newsSwiper.params.spaceBetween = 300;
  //     newsSwiper.params.speed = 1000,
  //         newsSwiper.params.loop = true,
  //         newsSwiper.params.pagination = {
  //             el: '.test',
  //             type: 'bullets',
  //         },
  //         newsSwiper.update();
  // }
  // console.log(newsSwiper.params)

  // var divExistante = document.querySelector('.swiper-wrapper');
  // var nouvelleDiv = document.createElement('div');
  // nouvelleDiv.classList.add('swiper-pagination');
  // divExistante.insertAdjacentElement('afterend', nouvelleDiv);

  // let swiper;
  // const params = {
  //     pagination: {
  //         el: ".swiper-pagination",
  //         type: 'bullets',
  //         clickable:true,
  //     },
  //     speed: 100,
  //     loop:true,
  // };
  // function initSwiper(params) {
  //     swiper = new Swiper(".smartweb_herobanner .swiper", params);
  // }
  // initSwiper(params);
});
