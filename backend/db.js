const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'tools.json');

function readAll() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw || '[]');
}

function writeAll(tools) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tools, null, 2));
}

function getAll() {
  return readAll();
}

function getById(id) {
  return readAll().find((tool) => tool.id === id) || null;
}

function create(tool) {
  const tools = readAll();
  tools.push(tool);
  writeAll(tools);
  return tool;
}

function update(id, changes) {
  const tools = readAll();
  const index = tools.findIndex((tool) => tool.id === id);
  if (index === -1) return null;
  tools[index] = { ...tools[index], ...changes };
  writeAll(tools);
  return tools[index];
}

function remove(id) {
  const tools = readAll();
  const index = tools.findIndex((tool) => tool.id === id);
  if (index === -1) return false;
  tools.splice(index, 1);
  writeAll(tools);
  return true;
}

module.exports = { getAll, getById, create, update, remove };