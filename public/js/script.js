

/* print global pdf or page if on /map */

var button = document.getElementById('print');
button.addEventListener('click', function(e) {
  e.preventDefault();
  if (window.location.pathname === "/map") {
    window.print();
  } else {
    window.open(window.location.origin + "/map?print");
  }
});

/* automated print */
if (window.location.pathname === "/map" && window.location.search.indexOf("print") > -1) {
  var interval = setTimeout(function() {
    document.getElementById('loader').classList.add('hide');
    window.print();
  }, 5000);
} else {
  document.getElementById('loader').classList.add('hide');
}
