import React, { Component } from 'react';
const uniqid = require('uniqid');

class CityColumn extends Component {
  render() {
    return (
      <div className="location">
        <p className="location__title">{this.props.title}</p>
        <ul className="location__items">
          {this.props.data.map(
            element => <li
            onClick={() => this.props.showCity(element)} 
            key={uniqid()}>{element}</li>
          )}
        </ul>
      </div>
    )
  }
};

export default CityColumn;