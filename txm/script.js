const NUM_ACAB = 4;
const NUM_TXM = 32;
const NUM_ELEM = 8;
const API_KEY = '73f84f7dbe7b0f00feb9ca45876d5dd422137aaa';


function generateGrid(index) {
  let report_bools = null;
  window.location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      let tmp = item.split("=");
      if (tmp[0] === 'id') report_bools = expand(tmp[1]);
    });
    if (report_bools == null) report_bools = new Array(1024).fill(false);

  var container = document.getElementById("wrapper");
  for (let i = 1; i <= NUM_ACAB; i++) {
    let t = document.createTextNode("ACAB "+i);
    container.appendChild(t);
    var acab = document.createElement("div");
    acab.className = "ACAB";
    for (let j = 1; j <= NUM_TXM; j++) {
      var txm = document.createElement("div");
      txm.id = i + "T"+j;
      let t = document.createTextNode("T"+j);
      txm.appendChild(t);
      txm.className = "TxM";
      for (let k = 1; k <= NUM_ELEM; k++) {
        var btn = document.createElement("button");
        txm.appendChild(btn);
        btn.id = triplet_to_id(i, j, k);
        btn.className = report_bools[btn.id] ? "red" : "green";
        let t = document.createTextNode("E"+k);
        btn.appendChild(t);
        btn.onclick = function(ev) {
          if (ev.target.className == 'red')
            ev.target.className = 'green';
          else ev.target.className = "red";
        };
        txm.appendChild(btn);
      }
      acab.appendChild(txm);
      if (j==8 ||j==24) acab.appendChild(document.createElement("div"));
    }
    container.appendChild(acab);
  }
}

function generateReport() {
  report.innerText = '';
  for (let i = 1; i <= NUM_ACAB; i++) {
    let text = '';
    let counter = 0;
    for (let j = 1; j <= NUM_TXM; j++) {
       let txm_fail = false;
       let elem_fails = 0;
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
           elem_fails++;
         }
       }
      if (txm_fail == true) text += "; ";
      document.getElementById(i+"T"+j).style.backgroundColor = "#FF" + (16-2*elem_fails).toString(16).repeat(2) + "00";
    }

  var pct = (counter / 256 * 100).toFixed(1);
   let formmatted_text = "A"+i+": " + counter + "/256 (" + pct + "%)\n" + text + "\n";
   if (text) formmatted_text += "\n";
   report.innerText += formmatted_text;
   }
  document.getElementById("copy").innerHTML = "copy text";
  createLink(getUniqueString());
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
  let text = document.getElementById("report");
  var range = document.createRange();
  window.getSelection().removeAllRanges();
  range.selectNode(text);
  window.getSelection().addRange(range);
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
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

function createLink(id) {
  let url = encodeURI('http://163inno.github.io/txm/?id=' + id);
  let url_request = 'https://api-ssl.bitly.com/v3/shorten?access_token='+ API_KEY + '&longUrl=' + url;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4)
    {
      let url = JSON.parse(xhr.responseText).data.url;
      document.getElementById("report").innerText += "Visual Report: " + url;
    }
  };
  xhr.open('GET', url_request, true);
  xhr.send(null);
  return;
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
