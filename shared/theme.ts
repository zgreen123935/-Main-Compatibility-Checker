export const theme = {
  colors: {
    primary: "#BAE5D4",
    primaryBlack: "#2D2D2D",
    headingBlack: "#2D2D2D",
    bodyText: "#4B5563",
    secondaryText: "#6B7280",
    background: "#FFFFFF",
    cardBackground: "#FFFFFF",
    hoverState: "#F9FAFB",
    border: "#E5E7EB",
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      lineHeight: 1.2,
      fontWeight: "500",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "1.5rem",
      lineHeight: 1.3,
      fontWeight: "500",
    },
    body: {
      fontSize: "1rem",
      lineHeight: 1.5,
      fontWeight: "400",
    },
    large: {
      fontSize: "1.25rem",
      lineHeight: 1.6,
    },
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "2.5rem",
  },
  borderRadius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
  },
} as const
