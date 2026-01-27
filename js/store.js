// store.js
export let data = [];

// Load from localStorage if exists
const savedData = JSON.parse(localStorage.getItem("data")) || [];
data.push(...savedData);
// console.log(data);
// localStorage.clear();