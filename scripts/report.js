//Side-bar
function openSidebar(){ 
  document.getElementById("sidebar").classList.add("open");    
  document.getElementById("mobile-overlay").classList.add("show"); 
}
function closeSidebar(){ 
  document.getElementById("sidebar").classList.remove("open"); 
  document.getElementById("mobile-overlay").classList.remove("show"); 
}

