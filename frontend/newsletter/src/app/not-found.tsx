import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "var(--font-body), Georgia, serif",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-headline), Georgia, serif",
          fontSize: "clamp(3rem, 8vw, 6rem)",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        404
      </h1>
      <p style={{ fontSize: "1.25rem", color: "#555", marginTop: "0.75rem" }}>
        This page could not be found.
      </p>
      <Link
        href="/"
        style={{
          marginTop: "2rem",
          padding: "0.75rem 2rem",
          background: "#111",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "4px",
          fontSize: "1rem",
        }}
      >
        Back to the front page
      </Link>
    </main>
  );
}
