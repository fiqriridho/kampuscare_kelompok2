import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  centerWrapper: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
  },

  content: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
    paddingHorizontal: Platform.OS === "web" ? 28 : 16,
    paddingVertical: 24,
  },

  // Hero Card Banner (Campus Crimson Red & Student Vibe)
  heroCard: {
    backgroundColor: "#B91C1C",
    borderRadius: 20,
    padding: Platform.OS === "web" ? 28 : 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DC2626",
    ...Platform.select({
      ios: {
        shadowColor: "#991B1B",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  heroBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  heroBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  heroSubtitle: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#FECACA",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  heroTitle: {
    fontSize: Platform.OS === "web" ? 30 : 26,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  heroDesc: {
    fontSize: 13.5,
    color: "#FEE2E2",
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 720,
  },

  // Legacy header styles
  header: {
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  // Sections
  section: {
    marginBottom: 28,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  sectionDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 14,
    lineHeight: 20,
  },

  // Quick Action Buttons
  actionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  actionButton: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#B91C1C",
    ...Platform.select({
      ios: {
        shadowColor: "#DC2626",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: -0.1,
  },

  actionButtonSecondary: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#FEF2F2",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#FECACA",
  },

  actionButtonSecondaryText: {
    color: "#991B1B",
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: -0.1,
  },

  // Search input
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },

  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
  },

  // Status Cards Grid (Responsive for Web & Mobile)
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  statusCardEmpty: {
    flex: 1,
    minWidth: Platform.OS === "web" ? 180 : 140,
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#16A34A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },

  statusCardOccupied: {
    flex: 1,
    minWidth: Platform.OS === "web" ? 180 : 140,
    backgroundColor: "#FEF2F2",
    borderWidth: 1.5,
    borderColor: "#FECACA",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#DC2626",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },

  statusCardUpcoming: {
    flex: 1,
    minWidth: Platform.OS === "web" ? 180 : 140,
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#D97706",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },

  statusCardMaintenance: {
    flex: 1,
    minWidth: Platform.OS === "web" ? 180 : 140,
    backgroundColor: "#F5F3FF",
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#7C3AED",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },

  statusItem: {
    flex: 1,
    minWidth: 140,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },

  statusNumber: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0F172A",
  },

  statusNumberEmpty: {
    fontSize: 30,
    fontWeight: "900",
    color: "#15803D",
  },
  statusNumberOccupied: {
    fontSize: 30,
    fontWeight: "900",
    color: "#B91C1C",
  },
  statusNumberUpcoming: {
    fontSize: 30,
    fontWeight: "900",
    color: "#B45309",
  },
  statusNumberMaintenance: {
    fontSize: 30,
    fontWeight: "900",
    color: "#6D28D9",
  },

  statusLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginTop: 4,
    textAlign: "center",
  },

  // Report Card (Featured Campus Alert)
  reportCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    borderLeftWidth: 6,
    borderLeftColor: "#DC2626",
    ...Platform.select({
      ios: {
        shadowColor: "#DC2626",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },

  reportTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  reportBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  reportBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#B91C1C",
  },

  reportTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  reportDescription: {
    fontSize: 13.5,
    color: "#475569",
    lineHeight: 20,
  },

  reportFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  reportFooterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  // Shared Cards & Forms
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  infoLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  infoValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  formGroup: {
    marginBottom: 16,
  },

  formLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },

  formInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
  },

  formTextArea: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    minHeight: 100,
    textAlignVertical: "top",
  },

  submitButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#DC2626",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
