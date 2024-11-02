document.addEventListener("DOMContentLoaded", function() {
    fetch("../Navbar/navbar.html")
      .then(response => response.text())
      .then(html => {
        document.querySelector("#navbar-placeholder").innerHTML = html;
      })
      .catch(error => {
        console.error('Error loading navbar:', error);
      });
  });