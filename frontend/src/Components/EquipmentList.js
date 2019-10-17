import React from "react";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import MaterialTable from "material-table";

const DELETE_EQUIPMENT = gql`
  mutation deleteEquipment($id: String!) {
    deleteSensor(id: $id) {
      id
    }
  }
`;

export const EquipmentList = ({ equipments }) => {
  const [state, setState] = React.useState({
    columns: [
      { title: "Code", field: "code" },
      { title: "Name", field: "name" },
      { title: "Equipment Classes", field: "equipmentClasses" }
    ],
    data: equipments
  });

  const [deleteEquipment, { deleteData }] = useMutation(DELETE_EQUIPMENT);

  return (
    <MaterialTable
      title="Equipments"
      columns={state.columns}
      data={state.data}
      editable={{
        onRowAdd: newData =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              const data = [...state.data];
              data.push(newData);
              setState({ ...state, data });
            }, 600);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              const data = [...state.data];
              data[data.indexOf(oldData)] = newData;
              setState({ ...state, data });
            }, 600);
          }),
        onRowDelete: oldData =>
          deleteEquipment({ variables: { id: oldData.id } }).then(resp => {
            const data = [...state.data];
            data.splice(data.indexOf(oldData), 1);
            setState({ ...state, data });
          })
      }}
    />
  );
};
