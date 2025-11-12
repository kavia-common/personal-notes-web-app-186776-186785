import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders brand title", () => {
  render(<App />);
  const title = screen.getByText(/Ocean Notes/i);
  expect(title).toBeInTheDocument();
});
