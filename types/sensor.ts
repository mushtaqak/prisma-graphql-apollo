import { objectType, stringArg, arg } from "nexus";

import { equipmentWithEquipmentClassesFragment } from "../fragments/equipments";

export const SensorType = objectType({
  name: "Sensor",
  definition: t => {
    t.string("code");
    t.string("name");
    t.id("id");
    t.list.field("children", { type: "Equipment" });
    t.list.field("equipmentClasses", { type: "EquipmentClass" });
    t.list.field("equipmentProperties", { type: "EquipmentProperty" });
    t.int("flow");
  }
});

export const sensorsQuery = {
  type: "Sensor",
  resolve: async (_, args, ctx) => {
    return await ctx.prisma
      .equipments({
        where: { equipmentClasses_some: { code: "sensor" } }
      })
      .$fragment(equipmentWithEquipmentClassesFragment); // Attach equipmentClasses in query output
  }
};

// Extend Equipment type to have a `sensorEquipmentsQuery` to Query object.
export const sensorEquipmentsQuery = {
  type: "Equipment",
  resolve: async (_, args, ctx) => {
    return await ctx.prisma.equipments({
      where: { equipmentClasses_some: { code: "sensor" } }
    });
    // .$fragment(equipmentWithEquipmentClassesFragment); // Attach equipmentClasses in query output
  }
};

export const createSensor = {
  type: "Sensor",
  args: {
    name: stringArg(),
    code: stringArg()
  },
  resolve: async (_, { name, code }, ctx) => {
    const sensorEquipmentClasses = await ctx.prisma.equipmentClasses({
      where: { code: "sensor" }
    });
    const equipmentClassID =
      sensorEquipmentClasses.length > 0 ? sensorEquipmentClasses[0].id : "";

    if (!equipmentClassID) {
      throw new Error("Could not find any `sensor` equipment class.");
    }

    const createdSensor = await ctx.prisma
      .createEquipment({
        code,
        name,
        equipmentClasses: {
          connect: {
            id: equipmentClassID
          }
        }
      })
      .$fragment(equipmentWithEquipmentClassesFragment);
    return createdSensor;
  }
};

export const createSensorWithClass = {
  type: "Sensor",
  args: {
    name: stringArg(),
    code: stringArg(),
    className: stringArg(),
    classCode: stringArg()
  },
  resolve: async (_, { name, code, className, classCode }, ctx) => {
    const createdSensor = await ctx.prisma
      .createEquipment({
        code,
        name,
        equipmentClasses: {
          create: {
            code: className,
            name: className
          }
        }
      })
      .$fragment(equipmentWithEquipmentClassesFragment);
    return createdSensor;
  }
};

export const updateSensor = {
  type: "Sensor",
  args: {
    id: stringArg(),
    name: stringArg(),
    code: stringArg()
  },
  resolve: async (_, { id, name, code }, ctx) => {
    const updatedSensor = await ctx.prisma
      .updateEquipment({
        data: { name, code },
        where: { id }
      })
      .$fragment(equipmentWithEquipmentClassesFragment);
    return updatedSensor;
  }
};

export const deleteSensor = {
  type: "Sensor",
  args: {
    id: stringArg()
  },
  resolve: async (_, { id }, ctx, info) => {
    const deletedSensor = await ctx.prisma.deleteEquipment({ id });
    return deletedSensor;
  }
};
