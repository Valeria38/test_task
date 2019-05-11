import React, { Component } from "react";
const uniqid = require("uniqid");

class LocationColumn extends Component {
  state = {
    active: []
  };

  addClass = (index, element) => {
    const { showDetails, data, title } = this.props;
    const newItems = Array(data.length).fill(false);
    const oldIndex = newItems[index];
    newItems[index] = !oldIndex;
    this.setState(
      {
        active: newItems
      },
      () => {
        showDetails(element);
      }
    );
  };

  removeClasses = element => {
    const { title, showDetails } = this.props;
    this.setState({
      active: []
    });
  };

  render() {
    const { title, data } = this.props;
    const { active } = this.state;

    return (
      <div className="location">
        <p className="location__title">{title}</p>
        {data.length ? (
          <ul className="location__items">
            {data.map((element, index) => (
              <li
                className={
                  active[index] ? "location__item active" : "location__item"
                }
                onClick={() => {
                  this.addClass(index, element);
                }}
                key={uniqid()}
              >
                {element}
              </li>
            ))}
          </ul>
        ) : title === "Countries" ? (
          <div className="location__loading">Loading...</div>
        ) : (
          <div className="location__loading" />
        )}
      </div>
    );
  }
}

export default LocationColumn;
