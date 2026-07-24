export default {
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 25px 60px rgba(15, 23, 42, 0.18)",
      },
      colors: {
        brand: {
          950: "#030712",
          900: "#0f172a",
          800: "#17213f",
        },
      },
    },
  },
  plugins: [],
};
