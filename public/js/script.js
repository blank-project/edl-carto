

/* print global pdf or page if on /map */

var button = document.getElementById('print');
console.log(button);
button.addEventListener('click', function(e) {
  e.preventDefault();
  if (window.location.pathname === "/map") {
    window.print();
  } else {
    window.open(e.target.href);
  }
});
