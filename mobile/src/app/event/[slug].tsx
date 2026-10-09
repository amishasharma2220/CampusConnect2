import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { RefreshControl, ScrollView, Share, StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Banner, Button, CategoryTag, ErrorState, InfoRow, Loading, StatusTag } from "@/components/ui";
import { eventsApi, WEB_URL } from "@/lib/api";
import { eventDateLabel, rupees, seatsLeft } from "@/lib/format";
import { catColor, colors, radius, type } from "@/lib/theme";
import { useQuery } from "@/lib/useQuery";

export default function EventDetails() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { data: e, error, loading, refreshing, refresh, reload } = useQuery(() => eventsApi.get(slug), [slug]);

  if (loading) return <Loading />;
  if (error || !e) return <ErrorState message={error ?? "Event not found."} onRetry={reload} />;

  const c = catColor(e.category);
  const left = seatsLeft(e);
  const capacityPct = e.max_capacity ? Math.min(1, (e.registration_count ?? 0) / e.max_capacity) : 0;
  const isOpen = e.status === "upcoming" && e.approval_status === "approved";
  const full = left === 0;

  const share = () =>
    Share.share({
      message: `${e.title} — ${eventDateLabel(e)}${e.venue ? ` at ${e.venue}` : ""}${WEB_URL ? `\n${WEB_URL}/events/${e.slug}` : ""}`,
    }).catch(() => {});

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={share} hitSlop={10} accessibilityLabel="Share event">
              <Ionicons name="share-outline" size={22} color={colors.ink} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 140, gap: 18 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <View style={[styles.hero, { backgroundColor: c.bg }]}>
          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
            <CategoryTag category={e.category} />
            {e.is_registered ? <StatusTag label="You're registered" tone="success" /> : null}
            {e.status !== "upcoming" ? <StatusTag label={e.status === "completed" ? "Completed" : "Cancelled"} tone={e.status === "cancelled" ? "danger" : "neutral"} /> : null}
          </View>
          <Text style={[type.display, { marginTop: 12 }]}>{e.title}</Text>
          {e.tagline ? <Text style={[type.body, { color: colors.navy, marginTop: 6 }]}>{e.tagline}</Text> : null}
          {e.organizer_club || e.organizer_name ? (
            <Text style={[type.small, { marginTop: 10 }]}>by {e.organizer_club || e.organizer_name}</Text>
          ) : null}
        </View>

        <View>
          <InfoRow icon="calendar-outline" label="Date" value={eventDateLabel(e)} />
          <InfoRow icon="time-outline" label="Time" value={e.time} />
          <InfoRow icon="location-outline" label="Venue" value={e.venue} />
          <InfoRow icon="pricetag-outline" label="Entry" value={e.is_paid && e.ticket_price ? rupees(e.ticket_price) : "Free"} />
        </View>

        {e.max_capacity ? (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={type.label}>Registrations</Text>
              <Text style={type.small}>
                {e.registration_count ?? 0} / {e.max_capacity}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${capacityPct * 100}%`, backgroundColor: full ? colors.danger : colors.primary }]} />
            </View>
          </View>
        ) : null}

        {e.description ? (
          <View style={{ gap: 8 }}>
            <Text style={type.label}>About this event</Text>
            <Text style={type.body}>{e.description}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {e.is_registered ? (
          <Banner tone="success" text="You're registered. See you there!" />
        ) : !isOpen ? (
          <Banner tone="warning" text={e.status === "completed" ? "This event has ended." : "Registration isn't open for this event."} />
        ) : full ? (
          <Banner tone="danger" text="This event is at full capacity." />
        ) : (
          <Button
            title={e.is_paid && e.ticket_price ? `Register · ${rupees(e.ticket_price)}` : "Register now"}
            icon="checkmark-circle-outline"
            onPress={() => router.push({ pathname: "/event/register", params: { slug: e.slug, title: e.title } })}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: 20 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
