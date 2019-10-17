import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";

import { client } from "./client";
import { EquipmentListPage } from "./EquipmentListPage";

function App() {
  return (
    <div className="App">
      <ApolloProvider client={client}>
        <div>
          <EquipmentListPage />
        </div>
      </ApolloProvider>
    </div>
  );
}

export default App;
