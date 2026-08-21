import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import App from "./App";
import "./styles.css";

const contentSlice = createSlice({
  name: "content",
  initialState: { section: null, elements: [] },
  reducers: {
    setGenerated(state, action) {
      state.section = action.payload.section;
      state.elements = action.payload.elements || [];
    },
    updateElement(state, action) {
      const { fieldId, value } = action.payload;
      const item = state.elements.find((x) => x.fieldId === fieldId);
      if (item) item.content = value;
    },
  },
});

const store = configureStore({
  reducer: { content: contentSlice.reducer },
});

export const { setGenerated, updateElement } = contentSlice.actions;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);