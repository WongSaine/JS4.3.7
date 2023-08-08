'use strict'

const SEARCH = document.getElementById('search');
const DROPDOWN = document.getElementById('dropdown');
const REPOLIST = document.getElementById('repo-list');
function debounce(fn, time) {
  let timerId;
  return () => {
    clearTimeout(timerId);
    timerId = setTimeout(fn, time);
  };
}
async function searchRepositories(searchString) {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${searchString}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}
function autocomplite(data, dropdown, repoList, search) {
  try {
    const clickHandlers = [];
    for (let i=4; i>=0; i--) {
      const repoName = data.items[i].name;
      dropdown.insertAdjacentHTML('afterbegin', 
      `<div class="dropdown">${repoName.charAt(0).toUpperCase() + repoName.slice(1)}</div>`);
      const dropdownItem = dropdown.querySelector('.dropdown');
      const clickHandler = () => {
        search.value = '';
        dropdown.querySelectorAll('.dropdown').forEach(item => {
          item.removeEventListener('click', clickHandlers[item.dataset.handlerIndex]);
        });
        dropdown.replaceChildren();
        favorite(data.items[i], repoList);
      };
      dropdownItem.addEventListener('click', clickHandler);
      dropdownItem.dataset.handlerIndex = clickHandlers.length;
      clickHandlers.push(clickHandler);
    }
  }
  catch {
    dropdown.insertAdjacentHTML('afterbegin', 
    `<div class="dropdown">По вашему запросу ничего не найдено!</div>`); 
  }
}
function favorite(data, repoList) {
  repoList.insertAdjacentHTML('afterbegin', `<div class="repo-item"><div>
  <div>Name: ${data.name}</div>
  <div>Owner: ${data.owner.login}</div>
  <div>Stars: ${data.stargazers_count}</div></div>
  <div class="repo-item__delete">✕</div></div>`);
  const newItem = repoList.firstChild;
  const deleteButton = newItem.lastChild;
  const deleteHandler = () => {
    newItem.remove();
    deleteButton.removeEventListener('click', deleteHandler);
  };
  deleteButton.addEventListener('click', deleteHandler);
}
async function main(search, dropdown, repoList) {
  dropdown.replaceChildren();
  if (search.value.trim().length === 0) return;
  const data  = await searchRepositories(search.value);
  dropdown.replaceChildren();
  autocomplite(data, dropdown, repoList, search);
}
SEARCH.addEventListener('input', debounce(() => main(SEARCH, DROPDOWN, REPOLIST), 500));