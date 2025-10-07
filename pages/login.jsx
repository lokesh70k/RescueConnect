import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the Login component to ensure it only runs on the client-side
const Login = dynamic(() => import("../components/auth/Login"), {
  ssr: false,
});

const LoginPage = () => {
  return <Login />;
};

export default LoginPage;