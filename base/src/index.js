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

  // Gestion du sticky menu avec deux comportements possibles
  // const header = document.querySelector("#portal-header-top");
  // if (header) {
  //   console.log("Sticky header script loaded.");
  //   const parentHeader = document.querySelector("#portal-header");
  //   const isBasicSticky = document.body.classList.contains("menu-sticky");
  //   const isStickyOnTop =
  //     document.body.classList.contains("menu-sticky-on-top");

  //   // Ne rien faire si aucune classe n'est présente
  //   if (!isBasicSticky && !isStickyOnTop) {
  //     return;
  //   }

  //   // Calculer la hauteur initiale du header (avant qu'il devienne sticky)
  //   const headerHeight = header.offsetHeight;
  //   const headerOffset = header.offsetTop;
  //   let lastScrollTop = 0;
  //   let accumulatedScroll = 0;

  //   // Définir la hauteur du header une seule fois
  //   document.documentElement.style.setProperty(
  //     "--header-height",
  //     headerHeight + "px"
  //   );

  //   // Fonction pour mettre à jour uniquement la position et la largeur
  //   function updateHeaderDimensions() {
  //     if (parentHeader) {
  //       const parentRect = parentHeader.getBoundingClientRect();
  //       const parentWidth = parentHeader.offsetWidth;
  //       const parentLeft = parentRect.left;
  //       document.documentElement.style.setProperty(
  //         "--header-width",
  //         parentWidth + "px"
  //       );
  //       document.documentElement.style.setProperty(
  //         "--header-left",
  //         parentLeft + "px"
  //       );
  //     }
  //   }

  //   // Initialiser les dimensions
  //   updateHeaderDimensions();

  //   window.addEventListener("scroll", function () {
  //     const currentScrollTop =
  //       window.pageYOffset || document.documentElement.scrollTop;

  //     // Gérer la classe sticky-is-top pour les deux modes
  //     if (currentScrollTop === 0) {
  //       header.classList.add("sticky-is-top");
  //     } else {
  //       header.classList.remove("sticky-is-top");
  //     }

  //     if (isBasicSticky) {
  //       // Comportement de base : sticky dès qu'on dépasse le header
  //       if (currentScrollTop > headerOffset) {
  //         header.classList.add("sticky");
  //         document.body.classList.add("has-sticky-header");
  //         updateHeaderDimensions();
  //       } else {
  //         header.classList.remove("sticky");
  //         document.body.classList.remove("has-sticky-header");
  //       }
  //     } else if (isStickyOnTop) {
  //       // Comportement avancé : sticky uniquement au scroll vers le haut
  //       const scrollingDown = currentScrollTop > lastScrollTop;
  //       const scrollDelta = Math.abs(currentScrollTop - lastScrollTop);

  //       // Seuil uniquement pour le scroll vers le haut (évite les micro-mouvements)
  //       const thresholdUp = 10;
  //       // Pas de seuil pour le scroll vers le bas (réactivité immédiate)
  //       const thresholdDown = 1;

  //       if (currentScrollTop > headerOffset + headerHeight) {
  //         // Dès qu'on dépasse le header, ajouter has-sticky-header et le garder
  //         document.body.classList.add("has-sticky-header");

  //         if (!scrollingDown && scrollDelta > thresholdUp) {
  //           // Scroll vers le haut avec dépassement du seuil : afficher le menu
  //           if (currentScrollTop === 0) {
  //             // Au niveau 0 : utiliser sticky-on-top
  //             header.classList.add("sticky-on-top");
  //             header.classList.remove("sticky-demi-active", "sticky-hidden");
  //           } else {
  //             // Pas au niveau 0 : utiliser sticky-demi-active
  //             header.classList.add("sticky-demi-active");
  //             header.classList.remove("sticky-on-top", "sticky-hidden");
  //           }
  //           updateHeaderDimensions();
  //         } else if (scrollingDown && scrollDelta > thresholdDown) {
  //           // Scroll vers le bas : cacher le menu immédiatement
  //           header.classList.add("sticky-hidden");
  //           header.classList.remove("sticky-on-top", "sticky-demi-active");
  //         }
  //       } else {
  //         // Pas encore dépassé le header : tout enlever
  //         header.classList.remove(
  //           "sticky-on-top",
  //           "sticky-demi-active",
  //           "sticky-hidden"
  //         );
  //         document.body.classList.remove("has-sticky-header");
  //       }

  //       lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  //     }
  //   });

  //   // Gérer le redimensionnement de la fenêtre
  //   window.addEventListener("resize", function () {
  //     // Retirer temporairement le sticky pour mesurer la hauteur naturelle
  //     const wasSticky =
  //       header.classList.contains("sticky") ||
  //       header.classList.contains("sticky-on-top") ||
  //       header.classList.contains("sticky-demi-active");
  //     const wasStickyOnTop = header.classList.contains("sticky-on-top");
  //     const wasStickyDemiActive =
  //       header.classList.contains("sticky-demi-active");
  //     const wasHidden = header.classList.contains("sticky-hidden");

  //     if (wasSticky || wasHidden) {
  //       header.classList.remove(
  //         "sticky",
  //         "sticky-on-top",
  //         "sticky-demi-active",
  //         "sticky-hidden"
  //       );
  //     }

  //     const newHeight = header.offsetHeight;
  //     document.documentElement.style.setProperty(
  //       "--header-height",
  //       newHeight + "px"
  //     );

  //     // Restaurer les classes
  //     if (wasSticky) {
  //       if (isBasicSticky) {
  //         header.classList.add("sticky");
  //       } else if (wasStickyOnTop) {
  //         header.classList.add("sticky-on-top");
  //       } else if (wasStickyDemiActive) {
  //         header.classList.add("sticky-demi-active");
  //       }
  //     }
  //     if (wasHidden) {
  //       header.classList.add("sticky-hidden");
  //     }

  //     updateHeaderDimensions();
  //   });
  // }

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
