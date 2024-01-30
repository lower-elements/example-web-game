import React, { Component, createRef } from "react";
import TreeView, { INode, flattenTree } from "react-accessible-treeview";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";
import { focusableElementsIn } from "../utils";

export interface Person {
    username: string;
}

interface PeopleListProps {
    people: Person[];
    AutoFocus?: boolean;
}
export default class PeopleList extends Component<PeopleListProps> {
    private data: INode<IFlatMetadata>[];
    private ref = createRef<HTMLUListElement>();
    constructor(props: PeopleListProps) {
        super(props);
        this.data = flattenTree({
            name: "",
            children: props.people.map((person) => ({ name: person.username })),
        });
    }
    componentDidMount(): void {
        if (this.props.AutoFocus && this.ref.current) {
            (focusableElementsIn(this.ref.current)[0] as HTMLElement)?.focus();
        }
    }
    render(): React.ReactNode {
        return (
            <TreeView
                data={this.data}
                ref={this.ref}
                nodeRenderer={({
                    element,
                    getNodeProps,
                    level,
                    handleSelect,
                }) => (
                    <div
                        {...getNodeProps()}
                        style={{ paddingLeft: 20 * (level - 1) }}
                    >
                        {element.name}
                    </div>
                )}
            />
        );
    }
}
