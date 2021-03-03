const NUM_ACAB = 4;
const NUM_TXM = 32;
const NUM_ELEM = 8;
const API_KEY = 'c7a84ece643847df9f7d28439102799f6ee24';


function generateGrid(index) {
  var container = document.getElementById("wrapper");
  for (let i = 1; i <= NUM_ACAB; i++) {
    let t = document.createTextNode("ACAB "+i);
    container.appendChild(t);
    var acab = document.createElement("div");
    acab.className = "ACAB";
    for (let j = 1; j <= NUM_TXM; j++) {
      var txm = document.createElement("div");
      let t = document.createTextNode("T"+j);
      txm.appendChild(t);
      txm.className = "TxM";
      for (let k = 1; k <= NUM_ELEM; k++) {
        var btn = document.createElement("button");
        txm.appendChild(btn);
        btn.className = "green";
        btn.id = triplet_to_id(i, j, k);
        let t = document.createTextNode("E"+k);
        btn.appendChild(t);
        btn.onclick = function(ev) {
          if (ev.target.className == 'red')
            ev.target.className = 'green';
          else ev.target.className = "red";
          generateReport();
        };
        txm.appendChild(btn);
      }
      acab.appendChild(txm);
    }
    container.appendChild(acab);
  }
}
  
function generateReport() {
  var report = document.getElementById("report");
  report.value = 'XXXXXXXXXX TxM Status Report on XXXXXX\n\n';
  for (let i = 1; i <= NUM_ACAB; i++) {
    let text = '';
    let counter = 0;
    for (let j = 1; j <= NUM_TXM; j++) {
       let txm_fail = false;
       for (let k = 1; k <= NUM_ELEM; k++) {
         let id = triplet_to_id(i, j, k);
         let elem = document.getElementById(id);
         if (elem.className == "red") {
           if (txm_fail) {
            text += ", "
           } else {
            text += j + " - ";
            txm_fail = true;
           }
           text += "E" + k;
           counter++;
         }
       }
      if (txm_fail == true) text += "; ";
    }
 
  var pct = (counter / 256 * 100).toFixed(1);
   text = "ACAB"+i+": " + counter + "/256 (" + pct + "%)\n" + text + "\n\n";
   report.value += text;
   }
  report.value += '\nReport Link: ' + createLink(getUniqueString());
  document.getElementById("copy").innerHTML = "copy text";

}

function resetApp() {
  for (let i = 1; i <= NUM_ACAB; i++) {
    for (let j = 1; j <= NUM_TXM; j++) {
      for (let k = 1; k <= NUM_ELEM; k++) {
        let id = triplet_to_id(i, j, k);
        let element = document.getElementById(id);
        element.className = "green";
      }
    }
  }
  generateReport()
}

function copyText(ev) {
  let textarea = document.getElementById("report");
  textarea.select();
  document.execCommand("copy");
  ev.innerHTML = "Copied!";
}

function triplet_to_id(acab, txm, elem) {
  let id = 0;
  id += (acab-1)*NUM_TXM*NUM_ELEM;
  id += (txm-1)*NUM_ELEM;
  id += elem-1;
  return id;
}

function id_to_triplet(id) {
  let acab = Math.floor(id / (NUM_TXM*NUM_ELEM) + 1);
  let txm = Math.floor(id / NUM_ELEM - (acab-1)*NUM_TXM + 1);
  let elem = id % NUM_ELEM + 1;
  return [acab, txm, elem];
}

function getUniqueString() {
  var bools = [];
  for (let i = 1; i <= NUM_ACAB; i++) {
    for (let j = 1; j <= NUM_TXM; j++) {
       for (let k = 1; k <= NUM_ELEM; k++) { 
         let id = triplet_to_id(i, j, k);
         let elem = document.getElementById(id)
         bools.push(elem.className === 'red');
       }
    }
  }
  return compress(bools);
}

function setUniqueString() {
  let string = document.getElementById("code").value;
  let bools = expand(string);
  console.log(bools);
  let cnt = 0;
  for (let i = 1; i <= NUM_ACAB; i++) {
    for (let j = 1; j <= NUM_TXM; j++) {
       for (let k = 1; k <= NUM_ELEM; k++) {
         let id = triplet_to_id(i, j, k);
         let elem = document.getElementById(id);
         elem.className = bools[cnt] ? 'red' : 'green';
         cnt++;
       }
    }
  }
  generateReport();
}

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

function createLink(id) {
  let data = {};
  let err = null;
  let url = encodeURI('http://163inno.github.io/txm/?id=' + id);
  getJSON('https://cutt.ly/api/api.php?key='+ API_KEY + '&short=' + url,
  function(err, data) {
    if (err !== null)  alert('Something went wrong: ' + err);
  });
  return data.url.shortlink;
}

// Array-of-bools to string converter
// From: https://stackoverflow.com/questions/59923537/js-convert-a-list-of-bools-to-a-compact-string

function convertBase(value, from_base, to_base) {
  var range = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'.split('');
  var from_range = range.slice(0, from_base);
  var to_range = range.slice(0, to_base);

  var dec_value = value.split('').reverse().reduce(function(carry, digit, index) {
    if (from_range.indexOf(digit) === -1) throw new Error('Invalid digit `' + digit + '` for base ' + from_base + '.');
    return carry += from_range.indexOf(digit) * (Math.pow(from_base, index));
  }, 0);

  var new_value = '';
  while (dec_value > 0) {
    new_value = to_range[dec_value % to_base] + new_value;
    dec_value = (dec_value - (dec_value % to_base)) / to_base;
  }
  return new_value || '0';
}

function compress(bools) {
  var sections = [], MAX_SAFE_SECTION = 52;
  for (var i = 0; i < bools.length; i++) {
    if (i % MAX_SAFE_SECTION == 0) sections.push([]);
    sections[Math.floor(i / MAX_SAFE_SECTION)][i % MAX_SAFE_SECTION] = bools[i] ? 1 : 0;
  }
  for (var i = 0; i < sections.length; i++) sections[i] = convertBase("1" + sections[i].join(""), 2, 64);
  return sections.join("");
}

function expand(str) {
  var sections = [];
  while (str.length > 0) str = str.replace(sections[sections.length] = str.substring(0, 9), "");
  for (var i = 0; i < sections.length; i++) sections[i] = convertBase(sections[i], 64, 2).substring(1);
  var bools = sections.join("").split("");
  for (var i = 0; i < bools.length; i++) bools[i] = bools[i] == "1";
  return bools;
}


window.onload = generateGrid;
