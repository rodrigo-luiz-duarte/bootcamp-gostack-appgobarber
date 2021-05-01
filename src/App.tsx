import "react-native-gesture-handler";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, StatusBar } from "react-native";

import AppProvider from "./hooks/index";

import Routes from "./routes";

const App: React.FC = () => (
  <NavigationContainer>
    <StatusBar barStyle="light-content" backgroundColor="#312E38" />
    <AppProvider>
      <View style={{ flex: 1, backgroundColor: "#312E38" }}>
        <Routes />
      </View>
    </AppProvider>
  </NavigationContainer>
);

export default App;
