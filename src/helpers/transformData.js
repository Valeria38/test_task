//Regular expressions for different address formats
const transformData = (country, city, street) => {
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
    return {
      houseNumber,
      newStreet,
      newCity
    }
};
export default transformData;