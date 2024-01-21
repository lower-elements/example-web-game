import React, { ChangeEvent, KeyboardEvent, Component} from 'react';

interface inputBoxProps {
  label: string;
  maxLength?: number;
  allowMultiLine?: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

interface InputBoxState {
  value: string;
}

export default class InputBox extends Component<inputBoxProps, InputBoxState> {
  private static inputCounter = 0;
  private inputId = `customInput_${InputBox.inputCounter++}`;

  constructor(props: inputBoxProps) {
    super(props);
    this.state = {
      value: '',
    };
  }

  handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { maxLength, onChange } = this.props;
    let value = event.target.value.slice(0, maxLength || 100);
    this.setState({ value });
    onChange(value);
  };

  handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { allowMultiLine, onSubmit } = this.props;
    const { value } = this.state;

    if (allowMultiLine && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit(value);
    } else if (!allowMultiLine && event.key === 'Enter') {
      event.preventDefault();
      onSubmit(value);
    }
  };

  render() {
    const { label, allowMultiLine } = this.props;
    const { value } = this.state;

    return (
      <div role="group">
        <label htmlFor={this.inputId}>{label}</label>
        {allowMultiLine ? (
          <textarea
            id={this.inputId}
            aria-label={label}
            aria-multiline="true"
            value={value}
            onChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
          />
        ) : (
          <input
            type="text"
            id={this.inputId}
            aria-label={label}
            value={value}
            onChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
          />
        )}
      </div>
    );
  }
}

