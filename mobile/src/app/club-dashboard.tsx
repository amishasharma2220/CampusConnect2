import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button, Card, EmptyState, ErrorState, Loading, StatusTag } from "@/components/ui";
import { clubAdminApi, WEB_URL } from "@/lib/api";
import { eventDateLabel } from "@/lib/format";
import { colors, radius, type } from "@/lib/theme";
import { useQuery } from "@/lib/useQuery";

/** Read-only snapshot for club admins; heavier management stays on the web dashboard. */
export default function ClubDashboard() {
  const q = useQuery(() => Promise.all([clubAdminApi.myClub(), clubAdminApi.stats(), clubAdminApi.events()]));

  if (q.loading) return <Loading />;
  if (q.error && !q.data) return <ErrorState message={q.error} onRetry={q.reload} />;
  const [club, stats, events] = q.data!;

  const tiles: [string, number][] = [
    ["Members", stats.club_members],
    ["Event sign-ups", stats.event_registrations],
    ["Live events", stats.approved_events],
    ["Awaiting approval", stats.pending_approval],
  ];

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 48 }}
      refreshControl={<RefreshControl refreshing={q.refreshing} onRefresh={q.refresh} tintColor={colors.primary} />}
    >
      <View>
        <Text style={type.label}>{club.department}</Text>
        <Text style={[type.display, { fontSize: 24, marginTop: 4 }]}>{club.name}</Text>
      </View>

      <View style={styles.grid}>
        {tiles.map(([label, value]) => (
          <View key={label} style={styles.tile}>
            <Text style={styles.tileValue}>{value}</Text>
            <Text style={type.small}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 10 }}>
        <Text style={type.label}>Your events</Text>
        {events.length === 0 ? (
          <Card>
            <EmptyState icon="add-circle-outline" title="No events yet" body="Create your first event from the web dashboard." />
          </Card>
        ) : (
          <Card style={{ paddingVertical: 4 }}>
            {events.map((e, i) => {
              const tone = e.approval_status === "approved" ? "success" : e.approval_status === "rejected" ? "danger" : "warning";
              return (
                <Pressable
                  key={e.id}
                  disabled={e.approval_status !== "approved"}
                  onPress={() => router.push({ pathname: "/event/[slug]", params: { slug: e.slug } })}
                  style={[styles.row, i < events.length - 1 && styles.divider]}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[type.body, { fontWeight: "600" }]} numberOfLines={1}>
                      {e.title}
                    </Text>
                    <Text style={type.small}>
                      {eventDateLabel(e)} · {e.registration_count}/{e.max_capacity} registered
                    </Text>
                  </View>
                  <StatusTag label={e.approval_status} tone={tone} />
                </Pressable>
              );
            })}
          </Card>
        )}
      </View>

      {WEB_URL ? (
        <Button title="Open full dashboard on the web" icon="open-outline" variant="secondary" onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/club/dashboard`)} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48%", flexGrow: 1, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 2 },
  tileValue: { fontSize: 26, fontWeight: "800", color: colors.ink },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
});
