//Side-bar
function openSidebar(){ 
  document.getElementById("sidebar").classList.add("open");    
  document.getElementById("mobile-overlay").classList.add("show"); 
}
function closeSidebar(){ 
  document.getElementById("sidebar").classList.remove("open"); 
  document.getElementById("mobile-overlay").classList.remove("show"); 
}

// CHART DATA
let currentMode = "6m";
const chartData = {
  "6m": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [320, 580, 490, 820, 1380, 1050]
  },
  "yr": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [320, 580, 490, 820, 1380, 1050, 1600, 1220, 980, 1450, 1800, 2100]
  }
};
