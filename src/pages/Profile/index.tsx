import React, { useCallback, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";

import * as Yup from "yup";

import { Form } from "@unform/mobile";
import { FormHandles } from "@unform/core";

import api from "../../services/api";

import getValidationErrors from "../../utils/getValidationErros";

import Input from "../../components/Input";
import Button from "../../components/Button";

import { launchCamera, launchImageLibrary } from "react-native-image-picker";

import {
  Container,
  BackButton,
  Title,
  UserAvatarButton,
  UserAvatar,
} from "./styles";
import { useAuth } from "../../hooks/auth";

interface ProfileFormData {
  name: string;
  email: string;
  oldPassword: string;
  password: string;
  passwordConfirmation: string;
}

const Profile: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { user, updateUser } = useAuth();

  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const passwordConfirmationInputRef = useRef<TextInput>(null);

  const navigation = useNavigation();

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleUpdateAvatar = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: "mixed",
      },
      (response) => {
        console.log(response);

        if (response.assets && response.assets.length > 0) {
          const formData = new FormData();

          const img = response.assets[0];

          formData.append("avatar", {
            type: img.type || "image/jpeg",
            name: img.fileName || `${user.id}.jpg`,
            uri: img.uri,
          });

          api.patch("/users/avatar", formData).then((apiResponse) => {
            updateUser(apiResponse.data);
          });
        }
      }
    );
  }, [updateUser, user.id]);

  const handleProfile = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required("Nome obrigatório"),
          email: Yup.string()
            .required("E-mail obrigatório")
            .email("Informe um e-mail válido"),
          oldPassword: Yup.string(),
          password: Yup.string().when("oldPassword", {
            is: (val: string) => !!val.length,
            then: Yup.string()
              .required("Senha obrigatória")
              .min(6, "Senha deve conter pelo menos 6 caracteres"),
            otherwise: Yup.string(),
          }),
          passwordConfirmation: Yup.string()
            .when("oldPassword", {
              is: (val: string) => !!val.length,
              then: Yup.string()
                .required("Senha obrigatória")
                .min(6, "Senha deve conter pelo menos 6 caracteres"),
              otherwise: Yup.string(),
            })
            .oneOf(
              [Yup.ref("password"), null],
              "Confirmação da nova senha não confere com a nova senha."
            ),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          name,
          email,
          oldPassword,
          password,
          passwordConfirmation,
        } = data;

        const formData = Object.assign(
          { name, email },
          oldPassword ? { oldPassword, password, passwordConfirmation } : {}
        );

        const response = await api.put("/profile", formData);

        updateUser(response.data);

        Alert.alert("Perfil atualizado com sucesso!", "");

        navigation.goBack();
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          const errors = getValidationErrors(error);
          formRef.current?.setErrors(errors);
          return;
        }

        Alert.alert(
          "Erro na atualização do perfil",
          "Ocorreu um erro na atualização do perfil, tente novamente."
        );
      }
    },
    [navigation, updateUser]
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled
      >
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Container>
            <BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>

            <UserAvatarButton onPress={handleUpdateAvatar}>
              <UserAvatar source={{ uri: user.avatarUrl }} />
            </UserAvatarButton>

            <View>
              <Title>Meu perfil</Title>
            </View>

            <Form
              ref={formRef}
              initialData={{
                name: user.name,
                email: user.email,
              }}
              onSubmit={handleProfile}
            >
              <Input
                name="name"
                placeholder="Nome"
                icon="user"
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />
              <Input
                ref={emailInputRef}
                name="email"
                placeholder="E-mail"
                icon="mail"
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => {
                  oldPasswordInputRef.current?.focus();
                }}
              />
              <Input
                ref={oldPasswordInputRef}
                name="oldPassword"
                placeholder="Senha atual"
                icon="lock"
                containerStyle={{ marginTop: 24 }}
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />

              <Input
                ref={passwordInputRef}
                name="password"
                placeholder="Nova senha"
                icon="lock"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordConfirmationInputRef.current?.focus();
                }}
              />

              <Input
                ref={passwordConfirmationInputRef}
                name="passwordConfirmation"
                placeholder="Confirmar senha"
                icon="lock"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />
            </Form>
            <Button
              onPress={() => {
                formRef.current?.submitForm();
              }}
            >
              Confirmar mudanças
            </Button>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
