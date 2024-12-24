
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'users.json');

function loadUsers() {
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

function addUser(number) {
    const users = loadUsers();
    if (!users.includes(number)) {
        users.push(number);
        saveUsers(users);
    }
}

module.exports = { addUser };