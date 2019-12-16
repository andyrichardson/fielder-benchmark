import React from "react";
import { useForm, useField, FielderProvider, useFormContext } from "fielder";

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
    validate: validateUsername,
    validateOnChange: true
  });

  const [passwordProps] = useField({
    name: "password",
    validate: validatePassword,
    validateOnChange: true
  });

  return (
    <div>
      <input type="text" {...usernameProps} />
      {usernameMeta.error && <p>{usernameMeta.error}</p>}
      <input type="password" {...passwordProps} />
    </div>
  );
};

const validateUsername = u => {
  if (!u) {
    throw Error("Username is undefined");
  }

  if (u.length < 3) {
    throw Error("Username must be at least 3 characters long");
  }
};

const validatePassword = p => {
  if (!u) {
    throw Error("Password is undefined");
  }
};
