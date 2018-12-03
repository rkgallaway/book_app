'use strict';

$('.hamburger').on('click', () => {

  $('.nav').animate({
    height: 'toggle'
  }, 100);

});

// $(document).ready(function(){ // reference https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_eff_toggle
//   $("button").click(function(){
//     $("p").toggle();
//   });
// });

$('.selectBook').on('click', () => {
  $('.bookDetails').toggle();
});
