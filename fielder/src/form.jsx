import React from "react";
import { useForm, useField, FielderProvider } from "fielder";

export const Form = () => (
  <FormProvider>
    <FormContent />
  </FormProvider>
);

const FormProvider = ({ children }) => {
  const formState = useForm();

  return <FielderProvider value={formState}>{children}</FielderProvider>;
};

const FormContent = () => {
  const [usernameProps, usernameMeta] = useField({
    name: "username",
    initialValue: '',
    validate: validateUsername,
  });

  const [passwordProps] = useField({
    name: "password",
    initialValue: '',
    validate: validatePassword,
  });

  return (
    <div>
      <input type="text" {...usernameProps} />
      {usernameMeta.error && <p>{usernameMeta.error}</p>}
      <input type="password" {...passwordProps} />
    </div>
  );
};

const validateUsername = ({ value }) => {
  if (!value) {
    throw Error("Username is undefined");
  }

  if (value.length < 3) {
    throw Error("Username must be at least 3 characters long");
  }
};

const validatePassword = ({ value }) => {
  if (!value) {
    throw Error("Password is undefined");
  }
};
