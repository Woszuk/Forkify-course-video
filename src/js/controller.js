import * as model from './model.js';
import {MODAL_CLOSE_SEC} from './config.js'
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import PaginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import paginationView from './views/paginationView';

if(module.hot) {
  module.hot.accept();
}

const controlRecipes = async function() {
  try {
    const id = window.location.hash.slice(1);

    if(!id) return;
    recipeView.renderSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.gerSearchResultsPage());

    // Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 1) Load recipe
    await model.loadRecipe(id);

    // 2) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }

};

const controlSearchResults = async function() {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery();
    if(!query) return;

    await model.loadSearchResults(query);

    // resultsView.render(model.state.search.results)
    resultsView.render(model.gerSearchResultsPage());

    // Render inirila pagination buttons
    paginationView.render(model.state.search);
  } catch(err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // Render NEW results
  // resultsView.render(model.state.search.results)
  resultsView.render(model.gerSearchResultsPage(goToPage));

  // Render NEW pagination buttons
  paginationView.render(model.state.search);
}

const controlServings = function(newServings) {
  // Update the recipe sevings (in state)
  model.updateServings(newServings);

  // Upadte the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function() {
  // Add/remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  
  // Update recipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe) {

  // Upload new recipe data
  try{
    // Show loading spinner
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message

    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    // Close form window
    setTimeout(function() {
      addRecipeView.toogleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch(err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
}

const init = function() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}

init();