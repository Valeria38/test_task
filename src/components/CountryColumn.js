import React, { Component } from 'react';
const uniqid = require('uniqid');
const handlers = require('react-handlers');

class CountryColumn extends Component {

  state = {
    active: []
  }

  componentWillReceiveProps (nextProps) {
    const { data } = nextProps;

    this.setState({
      active: Array(data.length).fill(false)
    }, () => console.log(this.state.active));
  }
  

  addClass = (index, element) => {

    const { active } = this.state;
    const newItems = Array(active.length).fill(false);
    newItems[index] = !newItems[index];

    this.setState(prevState => ({
      active: newItems
    }), () => console.log(this.state.active));

  }

  render() {
    const styles = {
      background: 'lightgray'
    }

    return (
      <div className="location">
        <p className="location__title">{this.props.title}</p>
          { this.props.data.length ? (
            <ul className="location__items">
              {this.props.data.map((element, index) => 
                <li
                  className={this.state.active[index] ? "location__item active" : "location__item"}
                  onClick={handlers(() => this.props.showCountry(element), () => this.addClass(index))} 
                  key={uniqid()}>{element}
                </li>
              )}
            </ul>
          ) : (
            <div className="location__loading">Loading...</div>
          ) }
      </div>
    )
  }
};

export default CountryColumn;