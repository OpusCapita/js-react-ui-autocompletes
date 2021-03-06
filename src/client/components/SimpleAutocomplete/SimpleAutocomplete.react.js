import PropTypes from 'prop-types';
import React, { Component } from 'react';
import s from './SimpleAutocomplete.module.less';
import fuzzysearch from 'fuzzysearch';
import VerticalList from '../VerticalList';
import { Motion, spring, presets } from 'react-motion';

export default
class SimpleAutocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.defaultValue,
      isFocused: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.defaultValue !== nextProps.defaultValue) {
      this.setState({ value: nextProps.defaultValue });
    }
  }

  focus() {
    if (this._input) {
      this._input.focus();
    }
  }

  handleInputChange(event) {
    let value = event.target.value;
    this.setState({ value });
    this.props.onChange(event, value);
  }

  handleItemClick(event, key) {
    this.props.onSelect(event, key);
    this._input.blur();
  }

  filterItems(items, filter, searchQuery) {
    return items.filter(item => filter(item.value, searchQuery));
  }

  handleFocus() {
    this.focus();
    this.setState({ isFocused: true });
  }

  handleBlur() {
    this.setState({ isFocused: false });
  }

  render() {
    let {
      defaultValue, // eslint-disable-line no-unused-vars
      filter,
      items,
      maxSuggessionsHeight,
      onChange, // eslint-disable-line no-unused-vars
      onSelect, // eslint-disable-line no-unused-vars
      inputElement,
      placeholder,
      origin,
      ...restProps
    } = this.props;
    let { value, isFocused } = this.state;
    let filteredItems = this.filterItems(items, filter, value);
    let inputProps = {
      ref: (ref => (this._input = ref)).bind(this),
      value,
      placeholder,
      onChange: this.handleInputChange.bind(this),
      ...restProps
    };

    let input = inputElement ?
      inputElement(inputProps) :
      (<input className={s.input} { ...inputProps } />);

    let showSuggessions = isFocused && filteredItems.length;
    let motionPreset = presets.stiff;
    let suggessionsContainer = (
      <Motion
        defaultStyle={{ x: 0, y: 0 }}
        style={{
          x: showSuggessions ? spring(maxSuggessionsHeight, motionPreset) : spring(0, motionPreset),
          y: showSuggessions ? spring(1, motionPreset) : spring(0, motionPreset)
        }}
      >{interpolatedStyle =>
        <div
          className={`
            ${s.suggessionsContainer}
            ${origin === 'top' ? s.suggessionsContainerTop : ' '}
          `}
          style={{
            maxHeight: `${interpolatedStyle.x}px`,
            opacity: interpolatedStyle.y
          }}
        >
          <div className={s.suggessions}>
            <VerticalList
              items={filteredItems}
              onClick={(event, key) => this.handleItemClick(event, key)}
            />
          </div>
        </div>}
      </Motion>
    );

    return (
      <div
        ref={ref => (this._autocomplete = ref)}
        tabIndex={-1}
        className={s.simpleAutocomplete}
        onFocus={this.handleFocus.bind(this)}
        onBlur={this.handleBlur.bind(this)}
      >
        {input}
        {suggessionsContainer}
      </div>
    );
  }
}

SimpleAutocomplete.propTypes = {
  defaultValue: PropTypes.string,
  filter: PropTypes.func,
  inputElement: PropTypes.func,
  placeholder: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    value: PropTypes.string
  })),
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  origin: PropTypes.oneOf(['top', 'bottom']),
  maxSuggessionsHeight: PropTypes.number
};
SimpleAutocomplete.defaultProps = {
  defaultValue: '',
  filter: (value1, value2) => fuzzysearch(value2.toLowerCase(), value1.toLowerCase()),
  items: [],
  maxSuggessionsHeight: 320,
  onChange: () => {},
  onSelect: () => {},
  origin: 'bottom',
  placeholder: ''
};
