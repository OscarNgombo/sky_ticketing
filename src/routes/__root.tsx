import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";

const NotFoundComponent = () => {
  // TanStack Router way to get current location
  const location = useLocation();
  const currentUrl = location.pathname + location.search;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "var(--primary-color)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#ffffff",
        textAlign: "center",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: "clamp(4rem, 15vw, 12rem)",
          fontWeight: "900",
          lineHeight: "0.8",
          marginBottom: "1rem",
          textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          letterSpacing: "-0.02em",
        }}
      >
        404
      </div>

      <h1
        style={{
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          fontWeight: "600",
          margin: "0 0 1rem 0",
          opacity: 0.9,
        }}
      >
        Page Not Found
      </h1>

      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          marginBottom: "2rem",
          maxWidth: "90%",
          wordBreak: "break-all",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            opacity: 0.8,
            marginBottom: "0.25rem",
          }}
        >
          URL not defined or existing:
        </p>
        <code
          style={{
            fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
            fontFamily: "Monaco, Consolas, monospace",
            color: "#ffeb3b",
            fontWeight: "500",
          }}
        >
          {currentUrl}
        </code>
      </div>

      <p
        style={{
          fontSize: "clamp(1rem, 3vw, 1.125rem)",
          margin: "0 0 2rem 0",
          opacity: 0.8,
          maxWidth: "600px",
          lineHeight: 1.5,
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={() => window.history.go(-1)}
          style={{
            padding: "0.75rem 2rem",
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.18) 100%)",
            border: "2px solid rgba(255,255,255,0.25)",
            borderRadius: "6px",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background 0.2s, border-color 0.2s, transform 0.2s",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(90deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.28) 100%)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.18) 100%)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          ← Go Back
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          style={{
            padding: "0.75rem 2rem",
            backgroundColor: "#ffffff",
            border: "2px solid #ffffff",
            borderRadius: "6px",
            color: "var(--primary-color, #000)",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          🏠 Go Home
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          animation: "float 6s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "15%",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          animation: "float 4s ease-in-out infinite reverse",
        }}
      />

      <style>
        {`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
          `}
      </style>
    </div>
  );
};

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
});
