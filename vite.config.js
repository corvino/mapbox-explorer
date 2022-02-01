import reactRefresh from "@vitejs/plugin-react-refresh";

export default ({ command }) => {
  if (command === "serve") {
    return {
      plugins: [reactRefresh()]
    };
  } else {
    return {};
  }
};
