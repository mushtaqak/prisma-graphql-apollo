import { prisma } from "./generated/prisma-client";
import datamodelInfo from "./generated/nexus-prisma";
import * as path from "path";
import { prismaObjectType, makePrismaSchema } from "nexus-prisma";
import { GraphQLServer } from "graphql-yoga";

import {
  SensorType,
  createSensor,
  createSensorWithClass,
  deleteSensor,
  sensorsQuery,
  updateSensor
} from "./types/sensor";

// Customize the "Query" building block
const Query = prismaObjectType({
  name: "Query",
  definition(t) {
    t.prismaFields(["*"]);
    // Add custom sensor query
    t.list.field("sensors", sensorsQuery);
  }
});

// Customize the "Mutation" building block
const Mutation = prismaObjectType({
  name: "Mutation",
  definition(t) {
    t.prismaFields(["*"]);
    t.field("createSensor", createSensor);
    t.field("createSensorWithClass", createSensorWithClass);
    t.field("updateSensor", updateSensor);
    t.field("deleteSensor", deleteSensor);
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
