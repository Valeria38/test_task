import React, { Component } from 'react';
import './App.css';
// import GoogleApiWrapper from './components/MainMap';
import CountryColumn from './components/CountryColumn';
import CityColumn from './components/CityColumn';
import CompanyColumn from './components/CompanyColumn';

const API_KEY = 'AIzaSyCjj3wuoUWKPBMR1HbUxyFn5lBnyjGOXKs';
const BASE_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=`;

class App extends Component {

  state = {
    countries: [],
    cities: [],
    companies: [],
    collection: {},
    data: null,
    address: {},
    coords: {
      lat: 53.35534,
      lng: 23.34618
    }
  };

  componentDidMount() {
    this.renderMap();

    fetch('https://api.myjson.com/bins/kmvt0')
    .then(response => response.json())
    .then(data => {
      data.Customers.map(obj => this.setState({ 
      //define all Countries with the value of empty array
        collection: {
          ...this.state.collection,
          [obj.Country]: []
        },
        data: data.Customers
      }, () => {
        console.log('Countries were successfully added to this.state.collection');
      }))
    
      this.addCitiesToCountries();

      this.sortCountries();
      
    })
    .catch(error => console.log(error));
}

//add cities to country arrays
addCitiesToCountries = () => {
  this.state.data.map(obj => this.setState({
    collection: {
      ...this.state.collection,
      [obj.Country]: [...this.state.collection[obj.Country], obj.City]
    }
  }, () => {
    console.log('Cities were added to country arrays');
  }));
}

sortCountries = () => {
  const { collection } = this.state;
  const sortedCountries = Object.keys(collection).sort((a, b) => {
    return collection[b].length - collection[a].length;
  });

  this.setState({
    countries: sortedCountries
  }, () => {
    console.log('Countries were sorted')
  });
}

showCountry = (country) => {
  
  const { collection } = this.state;

  //get an object: key(city) -> value(count of companies)
  const cities = collection[country].reduce((total, current) => {
    total[current] = (total[current] || 0) + 1;
    return total;
  }, {});

  //find a city with the greatest number of companies
  const sortedCities = Object.keys(cities).sort((a, b) => cities[b] - cities[a]);

  this.setState(prevState => ({
    cities: sortedCities,
    address: {...prevState.address, country: country}
  }));
}

showCity = (city) => {
  const { data } = this.state;

  const companies = data.filter(obj => obj['City'] === city);
  const companyNames = [];
  companies.forEach(company => companyNames.push(company.CompanyName));
  const sortedCompanies = companyNames.sort((a, b) => companyNames[a] - companyNames[b]);

  this.setState(prevState => ({
    companies: sortedCompanies,
    address: {...prevState.address, city}
  }));
}

showCompany = (company) => {
  console.log(company)
  const { data } = this.state;

  const street = data.filter(obj => obj['CompanyName'] === company)[0]['Address'];
  console.log(street);

  this.setState(prevState => ({
    address: {...prevState.address, street: street }
  }), () => {
    console.log(this.state.address);
    this.getCoords(this.state.address);// {country: 'UK', city: 'London', street: '120 Hanover St.'}
  });

}

getCoords = ({ country, city, street }) => {
  const houseNumber = parseInt(street) || "";
  const newStreet = street.replace(/^[ 0-9]+/g, '').split(" ").join("+"); 
  const newCity = city.replace(/\s/g, "");

  const url = `${BASE_URL}${houseNumber}+${newStreet}+${newCity}+${country}&key=${API_KEY}`;
  console.log('URL: ');
  console.log(url);
      
  fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log(data.results[0].geometry.location);

    this.setState({
      coords: data.results[0].geometry.location
    }, () => {
      this.initMap();
    });
  })
  .catch(error => console.log(error));
}

renderMap = () => {
  loadScript(
    `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`
  );
  window.initMap = this.initMap;
};

initMap = () => {
  const map = new window.google.maps.Map(document.getElementById("map"), {
    center: { lat: this.state.coords.lat, lng: this.state.coords.lng },
    zoom: 8
  });

  const marker = new window.google.maps.Marker({
    position: { lat: this.state.coords.lat, lng: this.state.coords.lng },
    map: map,
    title: "Hello World!"
  });
};

changePosition = ({ lat, lng }) => {
  this.setState({
      coords: { lat, lng }
    }, () => {
      this.initMap();
    });
};

  render() {
    // console.log(this.state);
    return (
      <div className="App">
        <CountryColumn 
          title="Countries" 
          data={this.state.countries}
          showCountry={this.showCountry}   
        />
        <CityColumn 
          title="Cities" 
          data={this.state.cities}
          showCity={this.showCity} 
        />
        <CompanyColumn 
          title="Company" 
          data={this.state.companies} 
          showCompany={this.showCompany} 
        />
        <div id="map" />
      </div>
    );
  }
  
}

function loadScript(url) {
  let index = window.document.getElementsByTagName("script")[0];
  let script = window.document.createElement("script");
  script.src = url;
  script.async = true;
  script.defer = true;
  index.parentNode.insertBefore(script, index);
}

export default App;
