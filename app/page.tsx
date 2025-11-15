"use client";

import { useEffect, useState } from "react";

type Show = {
  id: number;
  name: string;
  image?: {
    medium?: string;
    original?: string;
  };
  rating?: {
    average?: number | null;
  };
  genres?: string[];
  premiered?: string;
};

async function getShows(): Promise<Show[]> {
  // Client-side fetch (no revalidate here)
  const res = await fetch("https://api.tvmaze.com/shows");

  if (!res.ok) {
    throw new Error("Failed to fetch shows");
  }

  const data: Show[] = await res.json();
  return data.slice(0, 80);
}

function getYear(date?: string) {
  if (!date) return "—";
  return new Date(date).getFullYear().toString();
}

type RowProps = {
  title: string;
  items: Show[];
};

function Row({ title, items }: RowProps) {
  if (!items.length) return null;

  return (
    <section className="row">
      <h2 className="row__title">{title}</h2>
      <div className="row__container">
        <button
          className="row__arrow row__arrow--left"
          onClick={(e) => {
            const slider = e.currentTarget.nextSibling as HTMLDivElement | null;
            if (slider) {
              slider.scrollBy({
                left: -slider.clientWidth * 0.8,
                behavior: "smooth",
              });
            }
          }}
        >
          ❮
        </button>

        <div className="row__slider">
          {items.map((show) => (
            <article key={show.id} className="card">
              <div className="card__image-wrapper">
                <img
                  src={
                    show.image?.medium ||
                    show.image?.original ||
                    "https://via.placeholder.com/300x450?text=No+Image"
                  }
                  alt={show.name}
                  className="card__image"
                  loading="lazy"
                />
                {show.genres && show.genres.length > 0 && (
                  <span className="card__badge">{show.genres[0]}</span>
                )}
              </div>
              <div className="card__body">
                <h3 className="card__title" title={show.name}>
                  {show.name}
                </h3>
                <div className="card__meta">
                  <span>{getYear(show.premiered)}</span>
                  <span className="card__rating">
                    ★ {show.rating?.average ?? "—"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          className="row__arrow row__arrow--right"
          onClick={(e) => {
            const slider = e.currentTarget.previousSibling as HTMLDivElement | null;
            if (slider) {
              slider.scrollBy({
                left: slider.clientWidth * 0.8,
                behavior: "smooth",
              });
            }
          }}
        >
          ❯
        </button>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getShows();
        setShows(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load shows");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const trending = shows.slice(0, 20);
  const topRated = shows
    .filter((s) => (s.rating?.average ?? 0) >= 8)
    .slice(0, 20);
  const drama = shows.filter((s) => s.genres?.includes("Drama")).slice(0, 20);
  const sciFi = shows
    .filter((s) => s.genres?.includes("Science-Fiction"))
    .slice(0, 20);

  const hero = trending[0];

  return (
    <div className="page">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="navbar__logo">StreamFlex</div>
        <nav className="navbar__menu">
          <a href="#">Home</a>
          <a href="#">Series</a>
          <a href="#">Movies</a>
          <a href="#">My List</a>
        </nav>
        <div className="navbar__actions">
          <input
            type="text"
            className="navbar__search-input"
            placeholder="Search (UI only)"
          />
          <button className="navbar__button">Sign In</button>
        </div>
      </header>

      {/* HERO */}
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,.9) 10%, rgba(0,0,0,.1) 50%, rgba(0,0,0,.9)), url(${
            hero?.image?.original ||
            hero?.image?.medium ||
            "https://images.pexels.com/photos/7991379/pexels-photo-7991379.jpeg?auto=compress&cs=tinysrgb&w=1600"
          })`,
        }}
      >
        <div className="hero__content">
          <div className="hero__tag">
            {loading ? "Loading…" : hero ? "Top pick for you" : "No data"}
          </div>
          <h1 className="hero__title">
            {hero?.name ?? (error ? "Error loading shows" : "StreamFlex")}
          </h1>
          <div className="hero__meta">
            <span>{hero ? getYear(hero.premiered) : "2024"}</span>
            <span>•</span>
            <span>16+</span>
            <span>•</span>
            <span>{hero?.genres?.slice(0, 2).join(" • ") || "Drama"}</span>
          </div>
          <p className="hero__description">
            UI clone built with Next.js + TVMaze public API. No real streaming,
            just a demo dashboard like Netflix.
          </p>
          <div className="hero__buttons">
            <button className="hero__button hero__button--primary">▶ Play</button>
            <button className="hero__button hero__button--secondary">
              ⓘ More Info
            </button>
          </div>
          <p className="hero__subtext">
            {error ? error : "Live data • Demo project"}
          </p>
        </div>
      </section>

      {/* ROWS */}
      <main className="main">
        <Row title="Trending Now" items={trending} />
        <Row title="Top Rated" items={topRated} />
        <Row title="Drama Series" items={drama} />
        <Row title="Sci-Fi & Fantasy" items={sciFi} />
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>Netflix-style streaming dashboard clone for practice only.</p>
        <p>No real accounts, no playback – just UI and API data.</p>
      </footer>
    </div>
  );
}
