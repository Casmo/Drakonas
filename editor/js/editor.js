var currentZ = -121;

window.onload = function() {
    for (a = 0; a < 2; a++) {
        addRow();
    }
    document.getElementById('add').addEventListener('click', generateJson, false);
}

function addRow() {
    elMap = document.getElementById('map');

    for (b = 0; b < 5; b++) {
        rowHtml = '<div class="row">';
        for (i = 0; i <= 60; i++) {
            currentX = 30 - i;
            if (currentZ == -121) {
                if (i == 0) {
                    rowHtml += '<div class="obj">&nbsp;</div>';
                }
                rowHtml += '<div class="obj">'+ currentX +'</div>';
            }
            else {
                if (i == 0) {
                    rowHtml += '<div class="obj">'+ currentZ +'</div>';
                }
                rowHtml += '<div class="obj" id="pos-'+ currentX +'-'+ currentZ +'">&nbsp;</div>';
            }
        }
        rowHtml += '</div>';
        elMap.innerHTML = rowHtml + elMap.innerHTML;
        currentZ++;
    }
    objects = document.getElementsByClassName('obj');
    for (i = 0; i < objects.length; i++) {
        currentId = objects[i].getAttribute('id')
        if (currentId != null) {
            currentElement = document.getElementById(currentId);
            currentElement.removeEventListener('click');
            currentElement.addEventListener('click', function() { selectObject(this) }, false);
        }
    }
}

function selectObject(el) {
    currentId = el.getAttribute(('id'));
    matches = currentId.match(/^((pos-)((-)?[0-9]+)(\-)((-)?[0-9-]+))$/i);
    x = parseInt(matches[3]);
    z = parseInt(matches[6]);
    document.getElementById('info-object').innerHTML = currentId;
    document.getElementById('x').value = x;
    document.getElementById('z').value = z;
    document.getElementById('animation1x').value = x;
    document.getElementById('animation1z').value = (z - 7);
    document.getElementById('animation2x').value = x;
    document.getElementById('animation2z').value = (z - 14);
    document.getElementById('animation3x').value = x;
    document.getElementById('animation3z').value = (z - 21);
//    document.getElementById('animation4x').value = x;
//    document.getElementById('animation4z').value = (z - 20);
}

function generateJson() {
    if (document.getElementById('object').options[document.getElementById('object').selectedIndex].value == '') {
        document.getElementById('object').focus();
        return false;
    }
    if (document.getElementById('texture').options[document.getElementById('texture').selectedIndex].value == '') {
        document.getElementById('texture').focus();
        return false;
    }
    if (document.getElementById('x').value == '') {
        document.getElementById('x').focus();
        return false;
    }
    if (document.getElementById('z').value == '') {
        document.getElementById('z').focus();
        return false;
    }
    jsonOutput = '{';
    jsonOutput += '"ref":"'+ document.getElementById('object').options[document.getElementById('object').selectedIndex].value +'",';
    jsonOutput += '"texture":"'+ document.getElementById('texture').options[document.getElementById('texture').selectedIndex].value +'",';
    jsonOutput += '"position":{';
    jsonOutput += '"x":'+document.getElementById('x').value +',';
    jsonOutput += '"y":'+document.getElementById('y').value +',';
    jsonOutput += '"z":'+document.getElementById('z').value;
    jsonOutput += '},';

    spawn = 'true';
    if(!document.getElementById('spawn').checked) {
        spawn = 'false';
    }
    jsonOutput += '"spawn":'+ spawn +',';

    destroyable = 'true';
    if(!document.getElementById('destroyable').checked) {
        destroyable = 'false';
    }
    jsonOutput += '"destroyable":'+ spawn +',';
    jsonOutput += '"spawn":'+ spawn +',';

    collisionable = 'true';
    if(!document.getElementById('collisionable').checked) {
        collisionable = 'false';
    }
    jsonOutput += '"collisionable":'+ spawn +',';

    jsonOutput += '"stats":{';
    jsonOutput += '"hp":'+document.getElementById('hp').value +',';
    jsonOutput += '"color":"'+document.getElementById('color').value +'",';
    jsonOutput += '"score":'+document.getElementById('score').value;
    jsonOutput += '}';

    if (document.getElementById('animation1x').value != '') {
        jsonOutput += ',"movement":[';
        jsonOutput += '{';
        jsonOutput += '"x":'+document.getElementById('animation1x').value +',';
        jsonOutput += '"y":'+document.getElementById('animation1y').value +',';
        jsonOutput += '"z":'+document.getElementById('animation1z').value +',';
        jsonOutput += '"duration":'+document.getElementById('animation1duration').value +',';
        jsonOutput += '"easing":"'+document.getElementById('animation1easing').options[document.getElementById('animation1easing').selectedIndex].value +'"';
        jsonOutput += '}';
    }
    if (document.getElementById('animation2x').value != '') {
        jsonOutput += ',{';
        jsonOutput += '"x":'+document.getElementById('animation2x').value +',';
        jsonOutput += '"y":'+document.getElementById('animation2y').value +',';
        jsonOutput += '"z":'+document.getElementById('animation2z').value +',';
        jsonOutput += '"duration":'+document.getElementById('animation2duration').value +',';
        jsonOutput += '"easing":"'+document.getElementById('animation2easing').options[document.getElementById('animation2easing').selectedIndex].value +'"';
        jsonOutput += '}';
    }
    if (document.getElementById('animation2x').value != '') {
        jsonOutput += ',{';
        jsonOutput += '"x":'+document.getElementById('animation3x').value +',';
        jsonOutput += '"y":'+document.getElementById('animation3y').value +',';
        jsonOutput += '"z":'+document.getElementById('animation3z').value +',';
        jsonOutput += '"duration":'+document.getElementById('animation3duration').value +',';
        jsonOutput += '"easing":"'+document.getElementById('animation3easing').options[document.getElementById('animation3easing').selectedIndex].value +'"';
        jsonOutput += '}';
    }
    if (document.getElementById('animation4x').value != '') {
        jsonOutput += ',{';
        jsonOutput += '"x":'+document.getElementById('animation4x').value +',';
        jsonOutput += '"y":'+document.getElementById('animation4y').value +',';
        jsonOutput += '"z":'+document.getElementById('animation4z').value +',';
        jsonOutput += '"duration":'+document.getElementById('animation4duration').value +',';
        jsonOutput += '"easing":"'+document.getElementById('animation4easing').options[document.getElementById('animation4easing').selectedIndex].value +'"';
        jsonOutput += '}';
    }
    if (document.getElementById('animation1x').value != '') {
        jsonOutput += ']';
    }
    if (document.getElementById('shooting1timeout').value != '') {
        jsonOutput += ',"shooting": [';
        jsonOutput += '{';
        jsonOutput += '"timeout":' + document.getElementById('shooting1timeout').value +',';
        jsonOutput += '"direction":"' + document.getElementById('shooting1direction').value +'",';
        jsonOutput += '"ref":"' + document.getElementById('shooting1ref').value +'",';
        jsonOutput += '"speed":' + document.getElementById('shooting1speed').value;
        jsonOutput += '}';

        if (document.getElementById('shooting2timeout').value != '') {
            jsonOutput += ',{';
            jsonOutput += '"timeout":' + document.getElementById('shooting2timeout').value +',';
            jsonOutput += '"direction":"' + document.getElementById('shooting2direction').value +'",';
            jsonOutput += '"ref":"' + document.getElementById('shooting2ref').value +'",';
            jsonOutput += '"speed":' + document.getElementById('shooting2speed').value;
            jsonOutput += '}';
        }
        jsonOutput += ']';
    }
    jsonOutput += '}';

    output = JSON.parse(jsonOutput);
    output = JSON.stringify(output, undefined, 2);

    document.getElementById('json-output').innerHTML += '<pre>' + output + '</pre>';
}