var fileInput = document.getElementById('fileInput');

function analyzeHandler() {
    // getting the file
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const reader = new FileReader();

    // getting different lines 
    reader.onload = function (e) {
        const csv = e.target.result;
        const lines = csv.split('\n').map(line => line.trim());
        const data = [];

        // make the lines separate objects
        for (let i = 1; i < lines.length - 1; i++) {
            const [empid, projectid, datefrom, dateto] = lines[i].split(',');
            data.push({ empid, projectid, datefrom, dateto });
        }
        
        // getting the data and creates pairs
        const pairs = findLongestWorkingPairs(data);

        // handle the population of information to the index.html
        populateDataTable(pairs);
    };

    reader.readAsText(file);
}

// This function is handling the NULL value of dates. 
// When it`s NULL it`s appling today`s date
function emptyDateHandler(date) {
    var currentDate = date;
    var today = new Date();
    if (currentDate === '') {
        currentDate = today;
    }
    return currentDate
}

// This function determines if the respective employees 
// were working on the project at the same time
function checkPeriod(from1, to1, from2, to2) {
    // Convert strings to Date objects
    var emp1From = moment(emptyDateHandler(from1));
    var emp1To = moment(emptyDateHandler(to1));
    var emp2From = moment(emptyDateHandler(from2));
    var emp2To = moment(emptyDateHandler(to2));

    var result = false;

    if (emp1From < emp2To && emp1To > emp2From) {
        result = true;
    }
    return result
}

// This function calculation the duration of the period
// when respective employees were working together
function duration(from1, to1, from2, to2) {
    // Convert strings to Date objects
    var emp1From = moment(emptyDateHandler(from1));
    var emp1To = moment(emptyDateHandler(to1));
    var emp2From = moment(emptyDateHandler(from2));
    var emp2To = moment(emptyDateHandler(to2));

    var startDate = null;
    var endDate = null;

    if (emp1From >= emp2From) {
        startDate = emp1From;
    } else {
        startDate = emp2From;
    }

    if (emp1To <= emp2To) {
        endDate = emp1To;
    } else {
        endDate = emp2To;
    }
    // Calculate the difference in milliseconds between the two dates
    var timeDifference = endDate - startDate;
    // Convert milliseconds to days
    var daysDifference = timeDifference / (1000 * 60 * 60 * 24);
   
    return daysDifference
}

// This function populates the result into index.html
function populateDataTable(list) {
    var tbody = document.querySelector('#employees tbody');

    // Clear existing rows
    tbody.innerHTML = '';

    // Loop through the data and create table rows
    list.forEach(function (item) {
        var row = document.createElement('tr');

        // Create and append table cells for each property
        for (var key in item) {
            var cell = document.createElement('td');
            cell.textContent = item[key];
            row.appendChild(cell);
        }

        // Append the row to the tbody
        tbody.appendChild(row);
    });
}

// This functions clear the list of all pairs and 
// leaves only the pair with longest duration
function cleanUpList(list) {
    // Create a dictionary to store objects by project name
    const projects = {};

    // Iterate over the list
    list.forEach(obj => {
        const projectName = obj.project;
        // If project name is not in dictionary, add it
        if (!projects[projectName]) {
            projects[projectName] = obj;
        } else if (projects[projectName]) {
            // If project name is already in dictionary, compare durations
            if (obj.period > projects[projectName].period) {
                // If current object has longer duration, replace the stored object
                projects[projectName] = obj;
            }
        }
    });
    console.log(projects)
    // Convert dictionary values back to array
    const result = Object.values(projects);
    return result;
}

// This function is basically main function
function findLongestWorkingPairs(list) {
    var list = list;

    var pairList = [];
    // loop through all lines to match employees working on the same project
    for (let i = 0; i < list.length - 1; i++) {
        const emp1 = list[i];
        for (let j = i + 1; j < list.length; j++) {
            const emp2 = list[j];
            
            // checking if employees were working at the same time
            var check = checkPeriod(emp1.datefrom, emp1.dateto, emp2.datefrom, emp2.dateto)

            // checking if employees were working on the same project as well
            if (emp1.projectid == emp2.projectid && check) {
                // calculating duration
                var period = duration(emp1.datefrom, emp1.dateto, emp2.datefrom, emp2.dateto)

                // creating an object of pair
                var obj = {
                    empl1: emp1.empid,
                    empl2: emp2.empid,
                    project: emp1.projectid,
                    period: period,
                }
                
                // push the pair to the list
                pairList.push(obj)
            }
        }
    }
    console.log(pairList)
    // clean the list and leaving only the pairs working the longest on the same project
    pairList = cleanUpList(pairList);
    console.log(pairList)
    return pairList

}

// trigger for start the analyzer
fileInput.addEventListener('change', analyzeHandler);