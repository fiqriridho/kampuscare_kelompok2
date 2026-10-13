import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 20,
  },

  header: {
    marginBottom: 24,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 6,
  },

  sectionDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 14,
  },

  actionContainer: {
    flexDirection: "row",
    gap: 10,
  },

  actionButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  statusItem: {
    flex: 1,
    minWidth: 120,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  statusNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },

  statusLabel: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },

  reportCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 6,
  },

  reportDescription: {
    fontSize: 14,
    color: "#64748B",
  },

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
  },
});


