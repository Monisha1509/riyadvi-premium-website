import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: (callback) => {
      callback();
      return { revert: vi.fn() };
    },
    utils: { toArray: () => [] },
    fromTo: vi.fn(),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));
vi.mock("../components/Scene3D.jsx", () => ({
  default: () => <div data-testid="scene-3d" />,
}));
vi.mock("../components/HeroEcosystem3D.jsx", () => ({
  default: () => <div data-testid="hero-3d" />,
}));
vi.mock("../components/DigitalTransformation.jsx", () => ({
  default: () => <div data-testid="transformation-story" />,
}));
vi.mock("../components/TechnologyEcosystem.jsx", () => ({
  default: () => <div data-testid="technology-ecosystem" />,
}));
vi.mock("../lib/contentApi.js", () => ({
  useContentList: (_type, fallback) => ({ items: fallback }),
}));

import Home from "./Home.jsx";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );

const getWebDevelopmentCard = () =>
  screen.getAllByRole("article", {
    name: /web development service card/i,
  })[0];

const getReviewText = (pattern) => screen.getAllByText(pattern)[0];

describe("Home review carousel", () => {
  it("flips Home service cards on desktop hover and returns them on pointer leave", () => {
    renderHome();

    const card = getWebDevelopmentCard();

    fireEvent.mouseEnter(card);
    expect(card).toHaveAttribute("data-flipped", "true");

    fireEvent.mouseLeave(card);
    expect(card).toHaveAttribute("data-flipped", "false");

    fireEvent.click(
      within(card).getByRole("button", { name: /flip to explore/i }),
    );

    expect(card).toHaveAttribute("data-flipped", "true");
  });

  it("automatically advances to the next supplied review", () => {
    vi.useFakeTimers();
    renderHome();

    expect(
      getReviewText(/I personally had a great experience/i),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3800);
    });

    expect(
      getReviewText(/Best website development company/i),
    ).toBeInTheDocument();
  });

  it("pauses automatic advancement while the review card is hovered", () => {
    vi.useFakeTimers();
    renderHome();

    const reviewText = getReviewText(/I personally had a great experience/i);
    const reviewCard = reviewText.closest(".google-review-cards");

    expect(reviewCard).not.toBeNull();

    fireEvent.mouseEnter(reviewCard);

    act(() => {
      vi.advanceTimersByTime(8000);
    });

    expect(
      getReviewText(/I personally had a great experience/i),
    ).toBeInTheDocument();

    fireEvent.mouseLeave(reviewCard);

    act(() => {
      vi.advanceTimersByTime(3800);
    });

    expect(
      getReviewText(/Best website development company/i),
    ).toBeInTheDocument();
  });

  it("allows manually selecting reviews with the carousel controls", () => {
    renderHome();

    fireEvent.click(screen.getByRole("button", { name: /next review/i }));

    expect(
      getReviewText(/Best website development company/i),
    ).toBeInTheDocument();
  });
});
