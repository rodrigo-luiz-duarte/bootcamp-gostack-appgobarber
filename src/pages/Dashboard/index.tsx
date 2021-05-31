import { useNavigation } from "@react-navigation/core";
import React, { useCallback, useEffect, useState } from "react";
import Icon from "react-native-vector-icons/Feather";

import { useAuth } from "../../hooks/auth";
import api from "../../services/api";

import {
  Container,
  Header,
  HeaderTitle,
  UserName,
  ProfileButton,
  UserAvatar,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderInfo,
  ProviderName,
  ProviderMetaInfo,
  ProviderMetaInfoText,
  ProvidersListTitle,
} from "./styles";

export interface Provider {
  id: string;
  name: string;
  avatarUrl: string;
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  const { navigate } = useNavigation();

  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    api.get("/providers").then((response) => {
      setProviders(response.data);
    });
  }, []);

  const navigateToProfile = useCallback(() => {
    // navigate("Profile");
    signOut();
  }, [signOut]);

  const navigateToCreateAppointment = useCallback(
    (providerId: string) => {
      navigate("CreateAppointment", { providerId });
    },
    [navigate]
  );

  return (
    <Container>
      <Header>
        <HeaderTitle>
          Bem vindo, {"\n"}
          <UserName>{user.name}</UserName>
        </HeaderTitle>

        <ProfileButton onPress={navigateToProfile}>
          <UserAvatar source={{ uri: user.avatarUrl }} />
        </ProfileButton>
      </Header>

      <ProvidersList
        data={providers}
        ListHeaderComponent={
          <ProvidersListTitle>Cabeleireiros</ProvidersListTitle>
        }
        keyExtractor={(provider) => provider.id}
        renderItem={({ item: provider }) => (
          <ProviderContainer
            onPress={() => navigateToCreateAppointment(provider.id)}
          >
            <ProviderAvatar source={{ uri: provider.avatarUrl }} />

            <ProviderInfo>
              <ProviderName>{provider.name}</ProviderName>
              <ProviderMetaInfo>
                <Icon name="calendar" size={14} color="#ff9900" />
                <ProviderMetaInfoText>Segunda à sexta</ProviderMetaInfoText>
              </ProviderMetaInfo>

              <ProviderMetaInfo>
                <Icon name="clock" size={14} color="#ff9900" />
                <ProviderMetaInfoText>8h às 18h</ProviderMetaInfoText>
              </ProviderMetaInfo>
            </ProviderInfo>
          </ProviderContainer>
        )}
      />
    </Container>
  );
};

export default Dashboard;
