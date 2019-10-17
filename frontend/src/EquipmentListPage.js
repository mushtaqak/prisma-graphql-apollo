import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

import { EquipmentList } from "./Components/EquipmentList";

const EQUIPMENTS = gql`
  {
    equipments {
      id
      code
      name
      equipmentClasses {
        id
        code
        name
      }
    }
  }
`;

const formatData = equipments =>
  equipments.map(equipment => {
    equipment.equipmentClasses = JSON.stringify(equipment.equipmentClasses);
    return equipment;
  });

export const EquipmentListPage = () => {
  const { loading, error, data } = useQuery(EQUIPMENTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <h1>EquipmentListPage</h1>
      {data && data.equipments && (
        <EquipmentList equipments={formatData(data.equipments)} />
      )}
    </div>
  );
};
