export const equipmentWithEquipmentClassesFragment = `
  fragment equipmentWithEquipmentClassesFragment on Equipment {
    id
    code
    name
    equipmentClasses
      {
      id
      code
      name
    }
  }
  `;
