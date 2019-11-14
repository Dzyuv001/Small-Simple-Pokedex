

export const getURLParams = url => {
    // this is being used to support the older browsers that do not have the access to the URL object
    // adapted from https://www.sitepoint.com/get-url-parameters-with-javascript/
    console.log(`this is the query ${url}`);
    console.log(url);
    let queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    const obj = {};

    if (queryString) {
        queryString = queryString.split("#")[0];

        let strings = queryString.split("&");

        for (let i = 0; i < strings.length; i++) {
            let temp = strings[i].split("=");

            var paramName = temp[0];
            let paramValue = typeof (temp[1]) === "undefined" ? true : temp[1];

            paramName = paramName.toLowerCase();
            if (typeof paramValue === "string") paramValue = paramValue.toLocaleLowerCase();

            if (paramName.match(/\[(\d+)?\]$/)) {
                let key = paramName.replace(/\[(\d+)?\]$/, "");
                if (!obj[key]) obj[key] = [];

                if (paramName.match("/\[\d+\]$/")) {
                    let index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = paramValue;
                } else {
                    obj[key].push(paramValue);
                }
            } else {
                if (!obj[paramName]) {
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === "string") {
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    obj[paramName].push(paramValue);
                }
            }
        }
    }
    return obj;
};


//https://stackoverflow.com/questions/9907419/how-to-get-a-key-in-a-javascript-object-by-its-value
export const getValKey = (obj, value) => {
    for (var key in obj) {
        if (obj[key] == value) {
            return key;
        }
    }
    return null;
};

//https://www.w3schools.com/howto/howto_js_sort_table.asp
const getDataForSort = (rows, n, i, type) => {
    let tempArray = [];// the array will always have two value, since that is how a bubble sort works
    //get data
    let temp = i + 1;
    let a, b;
    if (type === "data") {
        a = rows[i].getElementsByTagName("td")[n].getAttribute("data-value");
        b = rows[temp].getElementsByTagName("td")[n].getAttribute("data-value");
    } else {
        a = rows[i].getElementsByTagName("td")[n].innerHTML.toLowerCase();
        b = rows[temp].getElementsByTagName("td")[n].innerHTML.toLowerCase();
    }
    tempArray = [a, b];
    //get whats inside the table tags
    for (let i1 = 0; i1 < 2; i1++) {
        // tempArray[1] = tempArray[1].innerHTML.toLowerCase();
        // check if that value should be a number or not
        if (type === "int" || type === "data") {
            if (tempArray[i1] === "_") {
                // check if the value is a number if not ranking it lower the others
                tempArray[i1] = -1;
            } else {
                //make the number numerical so it can be compared.
                tempArray[i1] = Number(tempArray[i1]);
            }

        }
    }
    return tempArray;
}

export const sortTable = (n, elementId, type) => {
    let table, rows, switching, i, shouldSwitch, dir, switchCount = 0;
    let elems = []; //stores the elements that will be compared for the sort
    table = document.getElementById(elementId);
    switching = true;
    dir = "asc";
    //will loop through the data until there is nothing left to switch
    while (switching) {
        switching = false;
        rows = table.rows;

        // loop through all table rows
        for (i = 1; i < rows.length - 1; i++) {
            shouldSwitch = false;
            elems = getDataForSort(rows, n, i, type);
            if (dir == "asc") {
                if (elems[0] > elems[1]) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (elems[0] < elems[1]) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchCount++;
        } else {
            if (switchCount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}
export const convertRemToPixels = (rem) => {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export const getPathFromUrl = (url) => {
    return url.split(/[?#]/)[0];
  }