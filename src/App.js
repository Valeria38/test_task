import React, { Component } from 'react';
import './App.css';
import LocationColumn from './components/LocationColumn';
import loadScript from './helpers/loadScript';
import { makeRequest, API_KEY, BASE_URL, DATA_FROM_SERVER } from './helpers/api';
import sort from './helpers/sort';

class App extends Component {

  state = {
    countries: [],
    cities: [],
    companies: [],
    collection: {},
    data: null,
    address: {},
    coords: {
      lat: 45.5154586,
      lng: -122.6793461
    }
  };

  componentDidMount() {
    this.renderMap();

    makeRequest(DATA_FROM_SERVER)
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
      }));
    
      this.addCitiesToCountries();

      this.sortCountries();
      
    })
    .catch(error => console.warn(error));
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

    let houseNumber;
    let newStreet;
    let newCity;

    switch(country) {
      case 'USA': 
      case 'Canada':
      case 'Ireland':
        houseNumber = parseInt(street) || "";
        newStreet = street.replace(/^[ 0-9]+(-\s)?/g, '')
        .replace(/\sSuite\s\d+(\w)?/, '')
        .replace(/Way/,"St")
        .replace(/Jefferson/, "SW Jefferson")
        .replace(/Dr./,"Rd. NW")
        .replace(/City Center Plaza 516 Main/,"516 E Main")
        .split(" ").join('+');
        newCity = city.replace(/\s/g, "+")
        .replace(/Elgin/, "South Elgin");
        break;

      case 'Germany': 
      case 'Brazil':
      case 'Mexico':
      case 'Spain':
      case 'Argentina':
      case 'Italy':
      case 'Sweden':
      case 'Austria':
      case 'Switzerland':
      case 'Portugal':
      case 'Belgium':
      case 'Denmark':
      case 'Finland':
      case 'Norway':
      case 'Poland':
        houseNumber = street.replace(/[A-Za-z\.\sßíóàêçñäúÅæ\/\,]+/, '');
        newStreet = street.replace(/\s\s+/g," ")
        .replace(/\//,"")
        .replace(/\,?\s\d+$/, '')
        .replace(/Platz/,'Str')
        .replace(/Provinciale/, "Provinciale Sud")
        .replace(/Bianco/, "Bianco Moncalieri")
        .replace(/Grenzacherweg/, "")
        .replace(/Estrada/, "Tv.")
        .replace(/Rua do Mercado/, "Alameda do Mercado")
        .split(" ").join('+');
        newCity = city.replace(/\s/g, "+")
        .replace(/Münster/,'Bocholt')
        .replace(/Å/, "Aa");;
        break;

      case 'France':
      case 'UK':
        houseNumber = parseInt(street) || "";
        newStreet = street.replace(/\s\s+/g," ")
        .replace(/^[ 0-9,]+(\s)?/g, '')
        .replace(/-/,"+")
        .split(" ").join("+");
        newCity = city.replace(/\s/g, "+");
        break;

      case 'Venezuela':
        houseNumber = parseInt(street) ||street.match(/\d+/)[0] || "";
        newStreet = street.replace(/\s\s+/g," ")
        .replace(/\d+ª?\s/, "")
        .replace(/\s#\d+-\d+/, "")
        .replace(/Carrera con\s/, "")
        .split(" ").join('+');
        newCity = city.replace(/\s/g, "+");
        break;

      default: 
        houseNumber = houseNumber = parseInt(street) || street.match(/\d+$/)[0] || "";
        newStreet = street.replace(/\s\s+/g," ")
        .split(" ").join('+');
        newCity = city.replace(/\s/g, "+");
        break;
    }

    const url = `${BASE_URL}${houseNumber}+${newStreet}+${newCity}+${country}&key=${API_KEY}`;
        
    makeRequest(url)
    .then(data => {
      this.setState({
        coords: data.results[0].geometry.location
      }, () => {
        this.initMap();
      });
    })
    .catch(error => console.warn(error));
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


export default App;
