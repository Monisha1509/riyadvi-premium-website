import React from "react";
import { afterEach, describe, it, expect } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ServiceFlipCard from "./ServiceFlipCard.jsx";

afterEach(() => {
  cleanup();
});

const service = {
  name: "Web Development",
  slug: "web-development",
  icon: "Code2",
  visual: "web",
  desc: "High-performing websites for business goals.",
  solution: "We build fast, accessible digital experiences.",
  features: [
    "Responsive layouts",
    "SEO-ready structure",
    "Accessible components",
  ],
};

const renderCard = () =>
  render(
    <MemoryRouter>
      <ServiceFlipCard service={service} index={0} detailed />
    </MemoryRouter>,
  );

const getServiceCard = () =>
  screen.getAllByRole("article", {
    name: /web development service card/i,
  })[0];

describe("ServiceFlipCard hover and accessible controls", () => {
  it("flips on desktop hover, returns on leave, and does not flip on focus alone", () => {
    renderCard();

    const card = getServiceCard();

    fireEvent.mouseEnter(card);
    expect(card).toHaveAttribute("data-flipped", "true");

    fireEvent.mouseLeave(card);
    expect(card).toHaveAttribute("data-flipped", "false");

    fireEvent.focus(card);
    expect(card).toHaveAttribute("data-flipped", "false");
  });

  it("supports the explicit button and restores the front", () => {
    renderCard();

    const card = getServiceCard();

    fireEvent.click(screen.getByRole("button", { name: /flip to explore/i }));

    expect(card).toHaveAttribute("data-flipped", "true");

    expect(screen.getByRole("link", { name: /get a quote/i })).toHaveAttribute(
      "href",
      "/contact?service=web-development",
    );

    expect(
      screen.getByRole("link", { name: /explore service/i }),
    ).toHaveAttribute("href", "/services/web-development");

    fireEvent.click(screen.getByRole("button", { name: /back to front/i }));

    expect(card).toHaveAttribute("data-flipped", "false");
  });

  it("removes hidden back links from keyboard tab order and supports Escape", () => {
    renderCard();

    const card = getServiceCard();

    const quoteLink = card.querySelector(
      'a[href="/contact?service=web-development"]',
    );

    const exploreLink = card.querySelector(
      'a[href="/services/web-development"]',
    );

    expect(quoteLink).not.toBeNull();
    expect(exploreLink).not.toBeNull();

    expect(quoteLink).toHaveAttribute("tabindex", "-1");
    expect(exploreLink).toHaveAttribute("tabindex", "-1");

    fireEvent.click(screen.getByRole("button", { name: /flip to explore/i }));

    expect(card).toHaveAttribute("data-flipped", "true");

    fireEvent.keyDown(window, { key: "Escape" });

    expect(card).toHaveAttribute("data-flipped", "false");

    expect(
      screen.getByRole("button", { name: /flip to explore/i }),
    ).toHaveFocus();
  });
});
