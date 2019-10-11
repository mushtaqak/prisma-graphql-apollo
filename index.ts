import { prisma } from "./generated/prisma-client";
import datamodelInfo from "./generated/nexus-prisma";
import * as path from "path";
import {  objectType, stringArg } from "nexus";
import { prismaObjectType, makePrismaSchema } from "nexus-prisma";
import { GraphQLServer } from "graphql-yoga";

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

// Customize the "Query" building block
const Query = prismaObjectType({
  name: "Query",
  definition(t) {
    t.prismaFields(["*"]);
    // Add custom sensor query
    t.list.field("sensors", {
      type: "Sensor",
      resolve: async (_, args, ctx) => {
        // TODO: attach equipmentClasses in query output
        return await ctx.prisma.equipments({
          where: { equipmentClasses_some: { code: "sensor" } }
        });
      }
    });
  }
});

// Customize the "Mutation" building block
const Mutation = prismaObjectType({
  name: "Mutation",
  definition(t) {
    t.prismaFields(["*"]);
    t.field("createSensor", {
      type: "Sensor",
      args: {
        name: stringArg(),
        code: stringArg(),
        // TODO: attach equipmentClasses
      },
      resolve: (_, { name, code }, ctx) =>
        ctx.prisma.createEquipment({
          code,
          name
        })
    });
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
