import React from "react";
import { useField, Formik } from "formik";

export const Form = () => (
  <FormProvider>
    <FormContent />
  </FormProvider>
);

const FormProvider = ({ children }) => {
  return (
    <Formik initialValues={{}} validateOnChange={true}>
      {children}
    </Formik>
  );
};

const FormContent = () => {
  const [usernameProps, usernameMeta] = useField({
    name: "username",
    validate: validateUsername
  });

  const [passwordProps] = useField({
    name: "password",
    validate: validatePassword
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
    return "Username is undefined";
  }

  if (u.length < 3) {
    return "Username must be at least 3 characters long";
  }
};

const validatePassword = p => {
  if (!p) {
    return "Password is undefined";
  }
};
