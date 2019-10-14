import { prisma } from "./generated/prisma-client";
import datamodelInfo from "./generated/nexus-prisma";
import * as path from "path";
import { objectType, stringArg } from "nexus";
import { prismaObjectType, makePrismaSchema } from "nexus-prisma";
import { GraphQLServer } from "graphql-yoga";

const equipmentWithEquipmentClassesFragment = `
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

const SensorType = objectType({
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

const sensorsQueryType = {
  type: "Sensor",
  resolve: async (_, args, ctx) => {
    return await ctx.prisma
      .equipments({
        where: { equipmentClasses_some: { code: "sensor" } }
      })
      .$fragment(equipmentWithEquipmentClassesFragment); // Attach equipmentClasses in query output
  }
};

const createSensorType = {
  type: "Sensor",
  args: {
    name: stringArg(),
    code: stringArg()
  },
  resolve: async (_, { name, code }, ctx) => {
    const sensorEquipmentClasses = await prisma.equipmentClasses({
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

// Customize the "Query" building block
const Query = prismaObjectType({
  name: "Query",
  definition(t) {
    t.prismaFields(["*"]);
    // Add custom sensor query
    t.list.field("sensors", sensorsQueryType);
  }
});

// Customize the "Mutation" building block
const Mutation = prismaObjectType({
  name: "Mutation",
  definition(t) {
    t.prismaFields(["*"]);
    t.field("createSensor", createSensorType);
  }
});

const schema = makePrismaSchema({
  types: [Query, SensorType, Mutation],

  prisma: {
    datamodelInfo,
    client: prisma
  },

  outputs: {
    schema: path.join(__dirname, "./generated/schema.graphql"),
    typegen: path.join(__dirname, "./generated/nexus.ts")
  }
});

const server = new GraphQLServer({
  schema,
  context: { prisma }
});
server.start(() => console.log("Server is running on http://localhost:4000"));
