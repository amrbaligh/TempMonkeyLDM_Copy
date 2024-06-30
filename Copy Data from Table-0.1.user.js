// ==UserScript==
// @name         Copy Data from Table
// @namespace    http://tampermonkey.net/
// @version      0.1.5
// @description  Add a button to copy data from a specific table to clipboard
// @author       Amr
// @match        https://balighlabldmwebapp.balighlab.com/LDM_Baligh/Pages/Registration/QSystemQueryFeesPreprations.aspx
// @grant        GM_setClipboard
// @grant        GM.xmlHttpRequest
// @updateURL    https://github.com/amrbaligh/TempMonkeyLDM_Copy/raw/main/Copy%20Data%20from%20Table-0.1.user.js
// @downloadURL  https://github.com/amrbaligh/TempMonkeyLDM_Copy/raw/main/Copy%20Data%20from%20Table-0.1.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to handle button click event
    function handleButtonClick(event) {
        event.preventDefault();
        const serviceIds = [];
        const precautions = [];

        // Select all rows in the table body except the header row
        const rows = document.querySelectorAll('#ctl00_MainContent_query1_grdServices_ctl00 tbody tr');

        // Prepare an array to store the copied data
        const data = [];
        let total = 0;
        // Loop through each row and extract Service and Cash columns
        rows.forEach(row => {
            const serviceCell =row.cells[3];
            const cashCell =row.cells[7];
            const instructionsCell =row.cells[11];
            if(!serviceCell || !cashCell || !instructionsCell) return;
            const service = serviceCell.textContent.trim(); // Service column (index 3)
            const cash = cashCell.textContent.trim();   // Cash column (index 7)
            total += Number(cash);
            data.push(`${service}: ${cash}`);

            const regex = /serviceId=(\d+)/i;
            const match = instructionsCell.querySelector('a').getAttribute('onclick').match(regex);
            serviceIds.push(match[1]);
        });

        // Join data with new lines and copy to clipboard
        console.log('serviceIds', `https://balighlabldmwebapp.balighlab.com/LDM_Baligh/pages/Registration/ServiceTestMethod.aspx?ServiceIds=${serviceIds.join(',')}`);
        GM.xmlHttpRequest ({
        method:     "GET",
        url:        `https://balighlabldmwebapp.balighlab.com/LDM_Baligh/pages/Registration/ServiceTestMethod.aspx?ServiceIds=${serviceIds.join(',')}`,
        onload:     function (response) {
            const doc = new DOMParser().parseFromString(response.responseText, 'text/html');
            const tableBodyRows = doc.querySelectorAll('#testMethod1_grdServices_ctl00 > tbody tr'); // Adjust selector for the table
            if (!tableBodyRows) throw new Error('Table not found on details page.');
            console.log(tableBodyRows); //display "ok"
            tableBodyRows.forEach(row => {
                const precautionsCell = row.cells[3];
                if(!precautionsCell) return;
                precautions.push(precautionsCell.textContent.trim());
            })

        const textToCopy =
`${data.join('\n')}
*Total = ${total} EGP*`
//- *شروط التحاليل*
//${precautions.join('\n')}`;
        console.log('text', textToCopy);
        GM_setClipboard(textToCopy);

        }
    });

        // Optionally, notify the user
        alert('تم نسخ البيانات بنجاح');
    }

    // Create a button element
    const button = document.createElement('button');
    button.textContent = 'Copy Data to Clipboard';
    button.style.margin = '10px';

    // Add click event listener to the button
    button.addEventListener('click', handleButtonClick);

    // Find a suitable place to append the button (you can adjust this selector based on your page structure)
    const targetElement = document.querySelector('.rgCommandRow'); // Adjust this selector if needed
    if (targetElement) {
        targetElement.querySelector('td').appendChild(button); // Append button to the first cell in the command row
    } else {
        console.error('Target element not found.');
    }
})();
