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
    paddingHorizontal: Platform.OS === "web" ? 32 : 18,
    paddingVertical: 24,
  },

  // Hero Card Banner (Professional Deep Burgundy / Maroon)
  heroCard: {
    backgroundColor: "#7F1D1D",
    borderRadius: 20,
    padding: Platform.OS === "web" ? 30 : 22,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: "#991B1B",
    ...Platform.select({
      ios: {
        shadowColor: "#450A0A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
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
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
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
    color: "#FECDD3",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  heroTitle: {
    fontSize: Platform.OS === "web" ? 28 : 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  heroDesc: {
    fontSize: 13.5,
    color: "#FFE4E6",
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 720,
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
    fontSize: 18.5,
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
    backgroundColor: "#7F1D1D",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#661818",
    ...Platform.select({
      ios: {
        shadowColor: "#450A0A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
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

  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
  },

  // Status Cards Grid
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
  },

  statusCardOccupied: {
    flex: 1,
    minWidth: Platform.OS === "web" ? 180 : 140,
    backgroundColor: "#FFF1F2",
    borderWidth: 1.5,
    borderColor: "#FECDD3",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
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
  },

  statusCardMaintenance: {
    flex: 1,
    minWidth: Platform.OS === "web" ? 180 : 140,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  statusNumberEmpty: {
    fontSize: 28,
    fontWeight: "900",
    color: "#166534",
  },
  statusNumberOccupied: {
    fontSize: 28,
    fontWeight: "900",
    color: "#9F1239",
  },
  statusNumberUpcoming: {
    fontSize: 28,
    fontWeight: "900",
    color: "#92400E",
  },
  statusNumberMaintenance: {
    fontSize: 28,
    fontWeight: "900",
    color: "#475569",
  },

  statusLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginTop: 4,
    textAlign: "center",
  },

  // Report Card (Clean & Authoritative)
  reportCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderLeftWidth: 5,
    borderLeftColor: "#7F1D1D",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
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
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECDD3",
  },

  reportBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#9F1239",
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
    backgroundColor: "#7F1D1D",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#450A0A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
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
