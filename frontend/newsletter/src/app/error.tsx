"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        Something went wrong
      </h1>
      <p style={{ fontSize: "1.15rem", color: "#555", marginTop: "0.75rem" }}>
        We hit an unexpected error. Please try again.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: "2rem",
          padding: "0.75rem 2rem",
          background: "#111",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </main>
  );
}
