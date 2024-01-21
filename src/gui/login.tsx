import React, { Component, ChangeEvent, FormEvent } from "react";

export interface LoginInfo {
    email: string;
    username: string;
    password: string;
}

type onLoginSubmitCallback = (info: LoginInfo) => void;

interface LoginFormProps {
    onSubmit: onLoginSubmitCallback;
}

interface LoginFormState {
    email: string;
    username: string;
    password: string;
    isValidEmail: boolean;
}
/**
 * A form to collect user account information.
 */
export default class LoginForm extends Component<
    LoginFormProps,
    LoginFormState
> {
    private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    constructor(props: LoginFormProps) {
        super(props);
        this.state = {
            email: "",
            username: "",
            password: "",
            isValidEmail: false,
        };
    }
    handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        this.setState({
            email: inputValue,
            isValidEmail: this.emailPattern.test(inputValue),
        });
    };
    handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            username: event.target.value,
        });
    };
    handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            password: event.target.value,
        });
    };
    handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { email, username, password, isValidEmail } = this.state;
        if (isValidEmail) {
            this.props.onSubmit({ email, username, password });
        } else {
            alert("Please enter a valid email address.");
        }
    };
    render() {
        const { email, username, password, isValidEmail } = this.state;
        return (
            <form onSubmit={this.handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        autoFocus
                        id="email"
                        type="text"
                        value={email}
                        maxLength={256}
                        onChange={this.handleEmailChange}
                        style={{ borderColor: isValidEmail ? "green" : "red" }}
                    />
                    {!isValidEmail && (
                        <p>Please enter a valid email address.</p>
                    )}
                </div>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        maxLength={24}
                        onChange={this.handleUsernameChange}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        maxLength={256}
                        onChange={this.handlePasswordChange}
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        );
    }
}
