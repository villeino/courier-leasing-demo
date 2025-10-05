import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

it("renderöi välilehdet ja auton kuvan", () => {
  render(<App />);
  expect(screen.getByTestId("nav-tabs")).toBeInTheDocument();
  expect(screen.getByTestId("tab-etusivu")).toBeInTheDocument();
  expect(screen.getByTestId("car-image")).toBeInTheDocument();
});
