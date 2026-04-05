import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick />
    </InternetIdentityProvider>
  </QueryClientProvider>
);

