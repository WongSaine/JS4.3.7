'use strict'

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
  for (let i=4; i>=0; i--) {
    const repoName = data.items[i].name;
    dropdown.insertAdjacentHTML('afterbegin', 
    `<div class="dropdown">${repoName.charAt(0).toUpperCase() + repoName.slice(1)}</div>`); 
    dropdown.firstChild.addEventListener('click', () => {
      search.value = '';
      dropdown.replaceChildren();
      favorite(data.items[i], repoList);
    });
  }
}
function favorite(data, repoList) {
  repoList.insertAdjacentHTML('afterbegin', `<div class="repo-item"><div>
  <div>Name: ${data.name}</div>
  <div>Owner: ${data.owner.login}</div>
  <div>Stars: ${data.stargazers_count}</div></div>
  <div class="repo-item__delete">✕</div></div>`);
  const newItem = repoList.firstChild;
  newItem.lastChild.addEventListener('click', () => newItem.remove());
}
async function main(search, dropdown, repoList) {
  dropdown.replaceChildren();
  if (search.value.trim().length === 0) return;
  const data  = await searchRepositories(search.value);
  dropdown.replaceChildren();
  autocomplite(data, dropdown, repoList, search);
}
const search = document.getElementById('search');
const dropdown = document.getElementById('dropdown');
const repoList = document.getElementById('repo-list');
search.addEventListener('input', debounce(() => main(search, dropdown, repoList), 600));