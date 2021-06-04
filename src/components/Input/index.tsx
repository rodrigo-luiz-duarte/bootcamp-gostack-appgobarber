import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from "react";
import { TextInputProps } from "react-native";
import { useField } from "@unform/core";

import { Container, TextInput, Icon } from "./styles";

interface IInputProps extends TextInputProps {
  name: string;
  icon: string;
  containerStyle?: {
    [key: string]: number | string;
  };
}

interface IInputValueReference {
  value: string;
}

interface IInputRef {
  focus(): void;
}

const Input: React.ForwardRefRenderFunction<IInputRef, IInputProps> = (
  { name, icon, containerStyle = {}, ...rest },
  ref
) => {
  const { fieldName, defaultValue = "", registerField, error } = useField(name);
  const inputValueRef = useRef<IInputValueReference>({ value: defaultValue });
  const inputElementRef = useRef<any>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    setIsFilled(!!inputValueRef.current.value);
  }, []);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputValueRef.current,
      path: "value",
      setValue(ref: any, value: string) {
        inputValueRef.current.value = value;
        inputElementRef.current.setNativeProps({ text: value });
      },
      clearValue() {
        inputValueRef.current.value = "";
        inputElementRef.current.clear();
      },
    });
  }, [fieldName, registerField]);

  useImperativeHandle(ref, () => {
    return {
      focus() {
        inputElementRef.current.focus();
      },
    };
  });

  return (
    <Container style={containerStyle} isFocused={isFocused} isErrored={!!error}>
      <Icon name={icon} color={isFocused || isFilled ? "#ff9000" : "#666360"} />

      <TextInput
        {...rest}
        ref={inputElementRef}
        placeholderTextColor="#666360"
        keyboardAppearance="dark"
        defaultValue={defaultValue}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onChangeText={(value) => {
          inputValueRef.current.value = value;
        }}
      />
    </Container>
  );
};

export default forwardRef(Input);
