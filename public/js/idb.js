// variable to hold db connection 
let db; 

const request = indexedDB.open('budget_tracker', 1);
console.log(request);

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    db.createObjectStore('budget', { autoIncrement: true });
};

request.onsuccess = function(event) { 
    db = event.target.result;

    if (navigator.onLine){ 
        uploadBudget();
    }
};

request.onerror = function(event) {
    console.error(event.target.errorCode);
};

// this function will be executed when we submit a new transaction and theres no internet connection
function saveRecord(record) {
    const transaction = db.transaction('budget', 'readwrite');

    const budgetObjectStore = transaction.objectStore('budget');
    
    budgetObjectStore.add(record)
};

// this function will handle collecting all of the data from the budget Obj Store and POST it to the server 
function uploadBudget() {
    // open a transaction
    const transaction = db.transaction(['budget'], 'readwrite');
    // access Obj Store
    const budgetObjectStore = transaction.objectStore('budget');

    // get all records from the store and set to a var 
    const getAll = budgetObjectStore.getAll();


    getAll.onsuccess = function(event) {
        // if there was data in indexedDB, send it to the api server 
        if (getAll.result.length > 0) {
            fetch('/api/transaction/', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {

                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(['budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('budget');
                budgetObjectStore.clear();
                
                alert('All recored transactions have been submitted');
            })
            .catch(err => console.log(err));
        }
    };
};


// listen for app coming back online 
window.addEventListener('online', uploadBudget);