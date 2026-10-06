import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ReportCard({ report }) {
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Selesai':
        return styles.badgeSuccess;
      case 'Diproses':
        return styles.badgeWarning;
      default:
        return styles.badgeDanger;
    }
  };

  return (
    <View style={styles.reportCard}>
      <View style={styles.reportContent}>
        <Text style={styles.reportTitle}>{report.title}</Text>
        <Text style={styles.reportLocation}>📍 {report.location}</Text>
        <Text style={styles.reportDate}>📅 {report.date}</Text>
      </View>
      <View style={styles.reportBadgeContainer}>
        <View style={[styles.reportStatusBadge, getBadgeStyle(report.status)]}>
          <Text style={styles.reportStatusText}>{report.status}</Text>
        </View>
        {report.votes !== undefined && (
          <Text style={styles.voteText}>👍 {report.votes}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  reportLocation: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  reportDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  reportBadgeContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  reportStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  reportStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  voteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
