/* print global pdf or page if on /map */
var button = document.getElementById('print');
button.addEventListener('click', function(e) {
  e.preventDefault();
  if (window.location.pathname === "/map") {
    // print now
    window.print();
  } else {
    // open new page with print param to force print
    window.open(window.location.origin + "/map?print");
  }
});

/* automated print */
if (window.location.pathname === "/map" && window.location.search.indexOf("print") > -1) {
  // add timeout 5s to print the page
  var interval = setTimeout(function() {
    // hide loader
    document.getElementById('loader').classList.add('hide');
    // print the page
    window.print();
  }, 5000);
} else {
  // hide loader
  document.getElementById('loader').classList.add('hide');
}
