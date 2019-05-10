import React, { Component } from 'react';
import '../App.css';
import LocationColumn from '../components/LocationColumn';
import loadScript from '../helpers/loadScript';
import { makeRequest, API_KEY, BASE_URL, DATA_FROM_SERVER } from '../helpers/api';
import sort from '../helpers/sort';
import transformData from '../helpers/transformData';

class Main extends Component {

  state = {
    countries: [],
    cities: [],
    companies: [],
    collection: {},
    data: null,
    address: {},
    coords: {
      lat: 0,
      lng: 0
    }
  };

  componentDidMount() {
    this.renderMap();

    makeRequest(DATA_FROM_SERVER)
    .then(data => {
      data.Customers.map(obj => this.setState({ 
      //define all countries with the value of empty array
        collection: {
          ...this.state.collection,
          [obj.Country]: []
        },
        data: data.Customers
      }, () => {
        console.log('Countries were successfully added to this.state.collection');
      }));
    
      this.addCitiesToCountries();

      this.sortCountries();
      
    })
    .catch(error => console.warn(error));
  }

  makeRequestAndUpdate = (url, data) => {
    return makeRequest(url)
    .then(data => {
      this.setState({
        coords: data.results[0].geometry.location
      }, () => {
        this.initMap();
      });
    })
    .catch(error => console.warn(error));
  }

  setdefaultView = (sortedCountries) => {
    const { collection, data } = this.state;

    let country = sortedCountries[0];
    let cities = collection[country].reduce((total, current) => {
      total[current] = (total[current] || 0) + 1;
      return total;
    }, {});
    let firstCity = sort(cities, 'cities')[0];
    let street = data.find(obj => obj['City'] === firstCity)['Address'];
    const { houseNumber, newStreet, newCity } = transformData(country, firstCity, street);
      
    const url = `${BASE_URL}${houseNumber}+${newStreet}+${newCity}+${country}&key=${API_KEY}`;
       
    this.makeRequestAndUpdate(url);
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
    const sortedCountries = sort(collection, 'countries');

    this.setState({
      countries: sortedCountries,
    }, () => {
      console.log('Countries were sorted');
      this.setdefaultView(sortedCountries);
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
    const sortedCities = sort(cities, 'cities');

    this.setState(prevState => ({
      cities: sortedCities,
      address: {...prevState.address, country}
    }));
  }

  showCity = (city) => {
    const { data } = this.state;
    const companies = data.filter(obj => obj['City'] === city);

    const companyNames = [];
    companies.forEach(company => companyNames.push(company.CompanyName));

    const sortedCompanies = sort(companyNames, 'companies');

    this.setState(prevState => ({
      companies: sortedCompanies,
      address: {...prevState.address, city}
    }));
  }

  showCompany = (company) => {
    console.log(company)
    const { data } = this.state;
    const street = data.filter(obj => obj['CompanyName'] === company)[0]['Address'];

    this.setState(prevState => ({
      address: {...prevState.address, street }
    }), () => {
      this.getCoords(this.state.address);
    });
  }

  getCoords = ({ country, city, street }) => {
    console.log(country,city,street);

    if (street.includes('\'')) {
      street = street.replace(/\'/, '');
    }

    const { houseNumber, newStreet, newCity } = transformData(country, city, street);
    const url = `${BASE_URL}${houseNumber}+${newStreet}+${newCity}+${country}&key=${API_KEY}`;
        
    this.makeRequestAndUpdate(url);
  }

  renderMap = () => {
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`
    );
    window.initMap = this.initMap;
  };

  initMap = () => {
    const { lat, lng } = this.state.coords;

    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat, lng },
      zoom: 15
    });

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map
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
    return (
      <div className="App">
        <LocationColumn 
          title="Countries" 
          data={this.state.countries}
          showDetails={this.showCountry}   
        />
        <LocationColumn 
          title="Cities" 
          data={this.state.cities}
          showDetails={this.showCity} 
        />
        <LocationColumn 
          title="Company" 
          data={this.state.companies} 
          showDetails={this.showCompany} 
        />
        <div className="map">
          <p className="map__title">Map</p>
          <div className="map__display">
            <div id="map"></div>
          </div>
        </div>
      </div>
    );
  }
}

export default Main;