  var checkbox = document.getElementById("permCheck2");
  var form = document.getElementById("perm2");

  checkbox.addEventListener("click", function() {

    console.log(form.style.visibility);

    if(form.style.visibility = "hidden") {
      form.style.visibility= "visible";
    } else {
      form.style.visibility= "hidden";
    }

  }, true);
