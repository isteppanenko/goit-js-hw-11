import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { createMarkup } from './setMarkup';
import { fetchImages } from './fetch';

const form = document.querySelector('#search-form');
const imagesContainer = document.querySelector('.gallery');
const guardJs = document.querySelector('.js-guard');

form.addEventListener('submit', onFormSubmit);
const simpleLightbox = new SimpleLightbox('.gallery a');

let searchValue;
let page = 1;

async function onFormSubmit(e) {
  try {
    e.preventDefault();
    observer.unobserve(guardJs);
    imagesContainer.innerHTML = '';
    page = 1;
    Loading.arrows();
    searchValue = form.elements.searchQuery.value.trim();
    const isValidInput = /^[a-zA-Z0-9\s]+$/.test(searchValue);
    if (!isValidInput || searchValue === '') {
      Report.warning('Invalid input', 'Please enter a valid search query.');
      Loading.remove();
      return;
    } else {
      const { hits, totalHits } = await fetchImages(searchValue);
      if (totalHits === 0) {
        Report.warning(
          'Nothing has defined',
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      Notify.success(`Hooray! We found ${totalHits} images`);
      imagesContainer.innerHTML = createMarkup(hits);
      simpleLightbox.refresh();
      e.target.reset();
      observer.observe(guardJs);
    }
  } catch (error) {
    Report.warning('Invalid input', 'Please enter a valid search query.');
    console.log(error);
  } finally {
    Loading.remove();
  }
}

async function fetchMoreImages() {
  try {
    Loading.arrows();
    page += 1;
    const { hits, totalHits } = await fetchImages(searchValue, page);
    imagesContainer.insertAdjacentHTML('beforeend', createMarkup(hits));
    simpleLightbox.refresh();
    if (hits.length < 40) {
      observer.unobserve(guardJs);
    }
    if (page > Math.round(totalHits / 40)) {
      setTimeout(() => {
        Report.failure(
          'Ups',
          "We're sorry, but you've reached the end of search results."
        );
      }, 1000);
    }
  } catch (err) {
    console.log(err);
    Report.failure(
      'Ups',
      "We're sorry, but you've reached the end of search results."
    );
  } finally {
    Loading.remove();
  }
}

let options = {
  root: null,
  rootMargin: '10px',
  threshold: 0,
};

let observer = new IntersectionObserver(handlerPagination, options);

async function handlerPagination(entries, observer) {
  for (let entry of entries) {
    if (entry.isIntersecting) {
      await fetchMoreImages();
    }
  }
}
