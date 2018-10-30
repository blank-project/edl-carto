/* print global pdf or page if on /map */
var button = document.getElementById('print');
if (button) {
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
}

/* automated print */
if (window.location.pathname === "/map" && window.location.search.indexOf("print") > -1) {
  // add timeout 5s to print the page
  var interval = setTimeout(function() {
    // hide loader
    document.getElementById('loader').classList.add('hide');
    // print the page
    window.print();
  }, 5000);
} else if (document.getElementById('loader')) {
  document.getElementById('loader').classList.add('hide');
}

/* script to show 2nd part of form for "hors les murs" */
var perm2 = document.getElementById('perm2');
if (perm2) {
  var checkbox = document.querySelector('input[name="perm2"]');
  toggleShowForm(checkbox, perm2);
  checkbox.addEventListener('change', function(e) {
    toggleShowForm(e.target, perm2);
  });
}

/* toggle showing of 2nd part form */
function toggleShowForm(checkbox, form) {
  if (checkbox.checked) {
    form.classList.add('show');
  } else {
    form.classList.remove('show');
  }
}
