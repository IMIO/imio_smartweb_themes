import "./scss/main.scss";
// import "https://unpkg.com/scrollreveal";
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
  if ($(".sectionnews .swiper").length > 0) {
    var newsSwiper = $(".sectionnews .swiper")[0].swiper;
    newsSwiper.params.spaceBetween = 30;
    (newsSwiper.params.speed = 1000), newsSwiper.update();
  }
  if ($(".sectionevents .swiper").length > 0) {
    var eventsSwiper = $(".sectionevents .swiper")[0].swiper;
    eventsSwiper.params.spaceBetween = 30;
    (eventsSwiper.params.speed = 1000), eventsSwiper.update();
  }

  ScrollReveal().reveal(".swiper-banner-content *", {
    delay: 500,
    duration: 1500,
    distance: "20%",
    origin: "bottom",
    interval: 100,
    opacity: 0,
  });

  ScrollReveal().reveal("#main-container .sectiontext .text", {
    delay: 100,
    duration: 1000,
    distance: "20%",
    origin: "bottom",
    interval: 100,
  });

  ScrollReveal().reveal(".custom-imio-map-use", {
    delay: 100,
    duration: 1000,
    distance: "20%",
    origin: "bottom",
    interval: 100,
  });

  ScrollReveal().reveal(".figure-left figure", {
    delay: 200,
    duration: 1000,
    distance: "20%",
    origin: "left",
  });

  ScrollReveal().reveal(".figure-right figure", {
    delay: 200,
    duration: 1000,
    distance: "20%",
    origin: "right",
  });

  // ScrollReveal().reveal("figure", {
  //   delay: 400,
  //   duration: 1500,
  //   distance: "20%",
  //   origin: "bottom",
  //   interval: 100,
  // });

  ScrollReveal().reveal(".section-title", {
    delay: 300,
    duration: 1500,
    distance: "20%",
    origin: "bottom",
  });

  ScrollReveal().reveal(".blocsx3 a", {
    delay: 300,
    duration: 1500,
    distance: "100%",
    origin: "bottom",
    interval: 100,
  });

  ScrollReveal().reveal(".bloc-app li", {
    delay: 400,
    duration: 1200,
    distance: "100%",
    origin: "bottom",
    interval: 100,
  });

  ScrollReveal().reveal(".bloc-temoignages .swiper-slide-active *", {
    delay: 300,
    duration: 1500,
    distance: "20%",
    origin: "bottom",
    interval: 100,
    opacity: 0,
  });

  ScrollReveal().reveal("#main-container header", {
    delay: 100,
    duration: 1000,
    distance: "20%",
    origin: "bottom",
    interval: 100,
  });

  // Qui sommes-nous

  ScrollReveal().reveal(".reveal-liste li", {
    delay: 400,
    duration: 800,
    distance: "50%",
    origin: "right",
    interval: 100,
  });

  // for custom map

  // const container = $(".map-use .html");
  // const image = $(".custom-imio-map-use");

  // let isDragging = false;
  // let startX, startY;
  // let initialX, initialY;

  // container.on("mousedown", (e) => {
  //   isDragging = true;
  //   container.css("cursor", "grabbing");

  //   // Enregistre les positions de départ
  //   startX = e.clientX;
  //   startY = e.clientY;

  //   // Enregistre la position initiale de l'image
  //   const rect = image.getBoundingClientRect();
  //   initialX = rect.left - container.getBoundingClientRect().left;
  //   initialY = rect.top - container.getBoundingClientRect().top;
  // });

  // container.on("mousemove", (e) => {
  //   if (!isDragging) return;

  //   // Calcule les déplacements
  //   const deltaX = e.clientX - startX;
  //   const deltaY = e.clientY - startY;

  //   // Applique les déplacements à l'image
  //   image.style.left = `${initialX + deltaX}px`;
  //   image.style.top = `${initialY + deltaY}px`;
  // });

  // container.on("mouseup", () => {
  //   isDragging = false;
  //   container.css("cursor", "grab");
  // });

  var isDragging = false;
  var startX, startY;
  var initialX, initialY;

  $(".map-use .html").on("mousedown", function (e) {
    isDragging = true;
    $(this).css("cursor", "grabbing");

    // Enregistre les positions de départ
    startX = e.clientX;
    startY = e.clientY;

    // Enregistre la position initiale de l'image
    var rect = $(".custom-imio-map-use")[0].getBoundingClientRect();
    var containerRect = $(".map-use .html")[0].getBoundingClientRect();
    initialX = rect.left - containerRect.left;
    initialY = rect.top - containerRect.top;

    e.preventDefault(); // Empêche le comportement par défaut du clic
  });

  $(document).on("mousemove", function (e) {
    if (!isDragging) return;

    // Calcule les déplacements
    var deltaX = e.clientX - startX;
    var deltaY = e.clientY - startY;

    // Applique les déplacements à l'image
    var newX = initialX + deltaX;
    var newY = initialY + deltaY;

    // Limites pour éviter que l'image sorte du conteneur
    var maxLeft = 0;
    var maxTop = 0;
    var maxRight =
      $(".map-use .html").width() - $(".custom-imio-map-use").width();
    var maxBottom =
      $(".map-use .html").height() - $(".custom-imio-map-use").height();

    if (newX > maxLeft) newX = maxLeft;
    // if (newY > maxTop) newY = maxTop;
    if (newX < maxRight) newX = maxRight;
    // if (newY < maxBottom) newY = maxBottom;

    $(".custom-imio-map-use").css({ left: newX + "px", top: newY + "px" });
  });

  $(document).on("mouseup", function () {
    isDragging = false;
    $(".map-use .html").css("cursor", "grab");
  });
});
