import { prisma } from "./generated/prisma-client";

async function createMultipleEquimentClasses() {
  // 1a. Create 2 equipment classes in one transaction - using parent.
  await prisma.createEquipmentClass({
    name: "Simple Child",
    code: "simple_child",
    parent: { create: { name: "Simple Parent", code: "simple_parent" } }
  });
  // 1b: PlayGround: Using variables
  /*
  # Create 2 equipment classes in one transaction - using variables.
  mutation createEquipmentClasses {
    var1: createEquipmentClass(
      data: {
        name: "Simple5"
        code: "simple5"
      }
    ) {
      id
      name
      code
    }
    var2: createEquipmentClass(
      data: {
        name: "Simple6"
        code: "simple6"
      }
    ) {
      id
      name
      code
    }
  }
  */
}

async function createComplexEquipment() {
  // // Save Equipment Class its properties and a Equipment with its properties in one single mutation
  // 2a. Prisma way
  await prisma.createEquipmentClass({
    name: "Sensor",
    code: "sensor",
    equipments: {
      create: [
        {
          code: "sensor_equipment",
          name: "Sensor Equipment",
          equipmentProperties: {
            create: {
              code: "sensor_equipment_property",
              name: "Sensor Equiment Property"
            }
          }
        }
      ]
    },
    equipmentClassProperties: {
      create: [
        {
          code: "T0001",
          name: "Sensor tag code"
        }
      ]
    }
  });

  // 2b. PlayGround
  /*
  mutation {
    createEquipmentClass(
      data: {
        name: "Sensor"
        code: "sensor"
        Equipment: {
          create: {
            code: "sensor_equipment"
            name: "Sensor Equipment"
            EquipmentProperties: {
              create: {
                code: "sensor_equipment_property"
                name: "Sensor Equiment Property"
              }
            }
          }
        }
        EquipmentClassProperties: {
          create: [
            {
              code: "sensor_equipment_class_property"
              name: "Sensor Equipment Class Property"
            }
          ]
        }
      }
    ) {
      id
      name
      code
    }
  }
  */
}

async function fetchSensorData() {
  // TODO: fetch data
  const equipments = await prisma.equipments({
    where: {
      equipmentClasses_every: {
        code: "sensor"
      },
      equipmentProperties_every: {
        code: "T0001"
      }
    }
  });
  console.log(equipments);
  /*
  query {
    equipments(where: {
      equipmentClasses_every: {
        code: "sensor"
      },
      equipmentProperties_every: {
        code: "T0001"
      }
    }){
      id code name
    }
  }
  */
}

async function updateEquipment() {
  await prisma.updateEquipment({
    data: {
      name: "Simple"
    },
    where: { id: "ck1kikp0z01660787ubo9f7cb" }
  });
}

async function deleteEquipment() {
  await prisma.deleteEquipment({
    id: "ck1kikp0z01660787ubo9f7cb"
  });
}

async function allEquipmentClasses() {
  const allEquipmentClasses = await prisma.equipmentClasses();
  console.log(allEquipmentClasses);
}

// A `main` function so that we can use async/await
async function main() {
  // 1. Multiple object in one transaction
  // createMultipleEquimentClasses();

  // 2. Create complex equipment class with related data
  // createComplexEquipment();

  // 3. Fetch sensor data
  fetchSensorData();

  // 4. Update equipment
  // updateEquipment();

  // 5. Delete equipment
  // deleteEquipment();

  // Read all equipment classes from the database and print them to the console
  // allEquipmentClasses();
}

main().catch(e => console.error(e));
