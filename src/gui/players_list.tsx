import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface OnlinePeopleGridProps {
    data: OnlinePerson[];
}

export interface OnlinePerson {
    id: number;
    username: string;
}

export default class OnlinePeopleGrid extends React.Component<OnlinePeopleGridProps> {
    handleCopyUsername = (username: string) => {};

    columns: GridColDef[] = [
        {
            field: "username",
            headerName: "Username",
            width: 250, // Adjust the width as needed
        },
    ];

    render() {
        return (
            <DataGrid
                rows={this.props.data}
                columns={this.columns}
                aria-label="Online users"
                disableRowSelectionOnClick
                hideFooter
            />
        );
    }
}
