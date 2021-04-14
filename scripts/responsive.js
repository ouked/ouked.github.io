var sidebar = document.getElementById("sidebar");
var sidebarButton = document.getElementById("sidebar-button");
var closeSidebarButton = document.getElementById("close-sidebar");

function openSidebar(e) {
    e.stopPropagation(); e.preventDefault();
    if (sidebar.className.indexOf("slideIn") !== -1) {
        sidebar.className = sidebar.className.replace(" slideIn", "");
    } else {
        sidebar.className = sidebar.className + " slideIn";
    }
}


sidebarButton.addEventListener("click", openSidebar, true);
closeSidebarButton.addEventListener("click", openSidebar, true);
sidebar.addEventListener('swiped-left', openSidebar, true);

