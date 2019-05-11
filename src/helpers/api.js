export const makeRequest = url => {
  return fetch(url).then(response => response.json());
};
export const API_KEY = "AIzaSyCjj3wuoUWKPBMR1HbUxyFn5lBnyjGOXKs";
export const BASE_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=`;
export const DATA_FROM_SERVER = "https://api.myjson.com/bins/kmvt0";
