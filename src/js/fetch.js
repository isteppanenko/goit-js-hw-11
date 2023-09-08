import axios from 'axios';
const BASE_URL = 'https://pixabay.com/api/';

async function fetchImages(searchValue, page = 1) {
  const params = new URLSearchParams({
    key: '39332620-63832f5becfa73b6f1df72379',
    q: searchValue,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: `${page}`,
  });

  const { data } = await axios.get(`${BASE_URL}?${params}`);
  return data;
}

export { fetchImages };
