import React, { Component, KeyboardEvent } from "react";
interface ChatInterfaceProps {
    onSubmit: (message: string) => void;
}

interface ChatInterfaceState {
    message: string;
}
export default class ChatGui extends React.Component<
    ChatInterfaceProps,
    ChatInterfaceState
> {
    constructor(props: ChatInterfaceProps) {
        super(props);
        this.state = {
            message: "",
        };
    }
    handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
        this.setState({ message: e.target.value });
    }
    handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevents the newline without shift
            this.sendMessage();
        }
    }
    sendMessage(): void {
        const { message } = this.state;
        if (message.trim() !== "") {
            // Call the onSubmit callback with the message
            this.props.onSubmit(message);
            this.setState({ message: "" });
        }
    }
    render() {
        const { message } = this.state;
        return (
            <div className="chat" role="application" aria-label="Chat">
                <textarea
                    autoFocus
                    value={message}
                    onChange={this.handleInputChange.bind(this)}
                    onKeyPress={this.handleKeyPress.bind(this)}
                    placeholder="Type your message..."
                    maxLength={2048}
                />
                <button onClick={this.sendMessage.bind(this)}>Send</button>
            </div>
        );
    }
}
