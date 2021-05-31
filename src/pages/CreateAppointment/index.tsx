import { useNavigation, useRoute } from "@react-navigation/core";
import React, { useCallback, useEffect, useState } from "react";
import Icon from "react-native-vector-icons/Feather";
import { useAuth } from "../../hooks/auth";
import api from "../../services/api";

import DateTimePicker from "@react-native-community/datetimepicker";

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  ProvidersListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
} from "./styles";
import { Platform } from "react-native";

interface RouteParams {
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatarUrl: string;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();

  const route = useRoute();

  const { goBack } = useNavigation();

  const routeParams = route.params as RouteParams;

  const [providers, setProviders] = useState<Provider[]>([]);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId
  );

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    api.get("/providers").then((response) => {
      setProviders(response.data);
    });
  }, []);

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker((state) => !state);
  }, []);

  const handleOnChangeDate = useCallback((event: any, date: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  }, []);

  return (
    <Container>
      <Header>
        <BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>

        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar source={{ uri: user.avatarUrl }} />
      </Header>

      <ProvidersListContainer>
        <ProvidersList
          data={providers}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(provider) => provider.id}
          renderItem={({ item: provider }) => (
            <ProviderContainer
              selected={provider.id === selectedProvider}
              onPress={() => handleSelectProvider(provider.id)}
            >
              <ProviderAvatar source={{ uri: provider.avatarUrl }} />
              <ProviderName selected={provider.id === selectedProvider}>
                {provider.name}
              </ProviderName>
            </ProviderContainer>
          )}
        />
      </ProvidersListContainer>

      <Calendar>
        <Title>Escolha a data</Title>

        <OpenDatePickerButton onPress={handleToggleDatePicker}>
          <OpenDatePickerButtonText>
            Selecionar outra data
          </OpenDatePickerButtonText>
        </OpenDatePickerButton>

        {showDatePicker && (
          <DateTimePicker
            mode="date"
            {...(Platform.OS === "ios" && { textColor: "#f4ede8" })} // < nessa linha
            display={Platform.OS === "android" ? "calendar" : "spinner"}
            value={selectedDate}
            onChange={handleOnChangeDate}
          />
        )}
      </Calendar>
    </Container>
  );
};

export default CreateAppointment;
