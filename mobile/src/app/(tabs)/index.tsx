import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EventCard } from "@/components/cards";
import { Card, EmptyState, ErrorState, Loading, SectionHeader, type IconName } from "@/components/ui";
import { eventsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { eventDateLabel, greeting, sortEvents } from "@/lib/format";
import { colors, radius, type } from "@/lib/theme";
import { useQuery } from "@/lib/useQuery";

export default function Home() {
  const { user } = useAuth();
  const { data, error, loading, refreshing, refresh, reload } = useQuery(() => eventsApi.list().then(sortEvents));
  const firstName = user?.full_name?.split(" ")[0] || "there";

  const upcoming = (data ?? []).filter((e) => e.status === "upcoming");
  const mine = upcoming.filter((e) => e.is_registered);
  const next = mine[0];
  const discover = upcoming.filter((e) => !e.is_registered).slice(0, 5);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <Text style={type.small}>{greeting()},</Text>
        <Text style={[type.display, { marginBottom: 20 }]}>{firstName} 👋</Text>

        {loading ? (
          <View style={{ height: 300 }}>
            <Loading label="Loading events… the server may take a minute to wake up." />
          </View>
        ) : error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            {next ? (
              <Pressable onPress={() => router.push({ pathname: "/event/[slug]", params: { slug: next.slug } })} style={styles.hero}>
                <Text style={[type.label, { color: colors.primary }]}>Your next event</Text>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {next.title}
                </Text>
                <View style={styles.heroMeta}>
                  <Ionicons name="calendar-outline" size={15} color="#C9CED6" />
                  <Text style={styles.heroMetaText}>
                    {eventDateLabel(next)}
                    {next.time ? ` · ${next.time}` : ""}
                  </Text>
                </View>
                {next.venue ? (
                  <View style={styles.heroMeta}>
                    <Ionicons name="location-outline" size={15} color="#C9CED6" />
                    <Text style={styles.heroMetaText}>{next.venue}</Text>
                  </View>
                ) : null}
              </Pressable>
            ) : null}

            <View style={styles.stats}>
              <Stat icon="ticket-outline" value={mine.length} label="Registered" onPress={() => router.push("/my-events")} />
              <Stat icon="sparkles-outline" value={upcoming.length} label="Upcoming" onPress={() => router.push("/events")} />
              <Stat icon="people-outline" value="Clubs" label="Explore" onPress={() => router.push("/clubs")} />
            </View>

            <SectionHeader title="Happening soon" action="See all" onAction={() => router.push("/events")} />
            {discover.length === 0 ? (
              <Card>
                <EmptyState
                  icon="calendar-clear-outline"
                  title={upcoming.length ? "You're registered for everything!" : "No upcoming events yet"}
                  body="New events show up here once the university approves them."
                />
              </Card>
            ) : (
              <View style={{ gap: 12 }}>
                {discover.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, value, label, onPress }: { icon: IconName; value: number | string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.stat, pressed && { opacity: 0.85 }]}>
      <Ionicons name={icon} size={20} color={colors.primaryDark} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={type.small}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 20, gap: 8, marginBottom: 16 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroMetaText: { color: "#C9CED6", fontSize: 14 },
  stats: { flexDirection: "row", gap: 10, marginBottom: 28 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 4 },
  statValue: { fontSize: 20, fontWeight: "800", color: colors.ink, marginTop: 4 },
});
