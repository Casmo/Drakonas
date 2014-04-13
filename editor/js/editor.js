var currentZ = -101;
function addRow() {
    elMap = document.getElementById('map');

    rowHtml = '<div class="row">';
    for (i = 0; i <= 60; i++) {
        currentX = 30 - i;
        if (currentZ == -101) {
            if (i == 0) {
                rowHtml += '<div class="obj">&nbsp;</div>';
            }
            rowHtml += '<div class="obj">'+ currentX +'</div>';
        }
        else {
            if (i == 0) {
                rowHtml += '<div class="obj">'+ currentZ +'</div>';
            }
            rowHtml += '<div class="obj" id="pos-'+ currentZ +'-'+ currentX +'">&nbsp;</div>';
        }
    }
    rowHtml += '</div>';
    elMap.innerHTML = rowHtml + elMap.innerHTML;
    currentZ++;
}

window.onload = function() {
    for (a = 0; a < 300; a++) {
        addRow();
    }
}